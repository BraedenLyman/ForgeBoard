import { useEffect, useState } from 'react';
import { Button, Card, Loading, Error, Modal, Input, Table, Popover } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Edit2, Trash2, Info } from 'lucide-react';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editModal, setEditModal] = useState({ open: false, project: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, projectId: null });
  const [infoPopover, setInfoPopover] = useState({ open: false, project: null, anchor: null });
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    status: 'active',
  });
  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients');
    }
  };

  const projectTitleRegex = /^[A-Za-z0-9 ]+$/;
  const projectDescriptionRegex = /^[A-Za-z0-9 .!?$#%(),'" ]+$/;
  const sanitizeTitleInput = (raw) => raw.replace(/[^A-Za-z0-9 ]+/g, '');
  const sanitizeDescriptionInput = (raw) => raw.replace(/[^A-Za-z0-9 .!?$#%(),'" ]+/g, '');

  const validateProject = (data) => {
    const errors = {};
    if (!data.clientId || !String(data.clientId).trim()) errors.clientId = 'Client is required';
    if (!data.title || !String(data.title).trim()) {
      errors.title = 'Title is required';
    } else if (!projectTitleRegex.test(String(data.title).trim())) {
      errors.title = 'Title may only include letters, numbers, and spaces';
    }
    if (data.description && !projectDescriptionRegex.test(String(data.description))) {
      errors.description = 'Description contains invalid characters';
    }
    return errors;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const errors = validateProject(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      await api.projects.create(formData);
      setIsModalOpen(false);
      setFormData({ clientId: '', title: '', description: '', status: 'active' });
      setFormErrors({});
      loadProjects();
    } catch (err) {
      setError(err.error?.message || 'Failed to create project');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const errors = validateProject(editModal.project);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    try {
      await api.projects.update(editModal.project._id, {
        clientId: editModal.project.clientId,
        title: editModal.project.title,
        description: editModal.project.description,
        status: editModal.project.status,
      });
      setEditModal({ open: false, project: null });
      setEditErrors({});
      loadProjects();
    } catch (err) {
      setError(err.error?.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.projects.delete(id);
      setDeleteModal({ open: false, projectId: null });
      loadProjects();
    } catch (err) {
      setError(err.error?.message || 'Failed to delete project');
    }
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'clientId',
      label: 'Client',
      render: (row) => row.clientId?.name || 'N/A',
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
          render: (row) => (
        <div className="flex gap-2">
          <button
            ref={el => {
              if (infoPopover.open && infoPopover.project && infoPopover.project._id === row._id) infoPopover.anchor = el;
            }}
            onClick={(e) => setInfoPopover({ open: true, project: row, anchor: e.currentTarget })}
            className="text-slate-500 hover:text-slate-700"
            title="View Info"
            type="button"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditModal({
              open: true,
              project: {
                ...row,
                clientId: row.clientId?._id || row.clientId,
                status: row.status || 'active',
              },
            })}
            className="text-blue-600 hover:text-blue-700"
            title="Edit Project"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, projectId: row._id })}
            className="text-red-600 hover:text-red-700"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sticky top-16 z-40 -mx-4 px-4 pt-4 pb-3 bg-slate-50/95 backdrop-blur border-b flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-center sm:text-left">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />New Project</span>
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.clientId && <span className="text-red-500 text-sm mt-1">{formErrors.clientId}</span>}
          </div>
          <Input
            label="Title"
            value={formData.title}
            error={formErrors.title}
            onChange={(e) => {
              const value = sanitizeTitleInput(e.target.value);
              setFormData({ ...formData, title: value });
              if (formErrors.title && String(value).trim() && projectTitleRegex.test(String(value).trim())) {
                setFormErrors({ ...formErrors, title: '' });
              }
            }}
            pattern="[A-Za-z0-9 ]+"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            error={formErrors.description}
            onChange={(e) => {
              const value = sanitizeDescriptionInput(e.target.value);
              setFormData({ ...formData, description: value });
              if (formErrors.description && projectDescriptionRegex.test(String(value))) {
                setFormErrors({ ...formErrors, description: '' });
              }
            }}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="completed">completed</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Create Project
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, project: null })} title="Edit Project">
        {editModal.project && (
          <form onSubmit={handleEdit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Client</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={editModal.project.clientId}
                onChange={(e) =>
                  setEditModal({ ...editModal, project: { ...editModal.project, clientId: e.target.value } })
                }
                required
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {editErrors.clientId && <span className="text-red-500 text-sm mt-1">{editErrors.clientId}</span>}
            </div>
            <Input
              label="Title"
              value={editModal.project.title}
              error={editErrors.title}
              onChange={(e) => {
                const value = sanitizeTitleInput(e.target.value);
                setEditModal({ ...editModal, project: { ...editModal.project, title: value } });
                if (editErrors.title && String(value).trim() && projectTitleRegex.test(String(value).trim())) {
                  setEditErrors({ ...editErrors, title: '' });
                }
              }}
              pattern="[A-Za-z0-9 ]+"
              required
            />
            <Input
              label="Description"
              value={editModal.project.description || ''}
              error={editErrors.description}
              onChange={(e) => {
                const value = sanitizeDescriptionInput(e.target.value);
                setEditModal({ ...editModal, project: { ...editModal.project, description: value } });
                if (editErrors.description && projectDescriptionRegex.test(String(value))) {
                  setEditErrors({ ...editErrors, description: '' });
                }
              }}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={editModal.project.status || 'active'}
                onChange={(e) =>
                  setEditModal({ ...editModal, project: { ...editModal.project, status: e.target.value } })
                }
              >
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, projectId: null })}
        title="Delete Project?"
      >
        <div className="mb-4">Are you sure you want to delete this project? This action cannot be undone.</div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => handleDelete(deleteModal.projectId)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, projectId: null })}>
            Cancel
          </Button>
        </div>
      </Modal>

      <div className="md:hidden space-y-4">
        {projects.map((project) => (
          <Card key={project._id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-slate-900">{project.title}</div>
              <div className="flex gap-2 items-center">
                <button
                  ref={el => {
                    if (infoPopover.open && infoPopover.project && infoPopover.project._id === project._id) infoPopover.anchor = el;
                  }}
                  onClick={(e) => setInfoPopover({ open: true, project, anchor: e.currentTarget })}
                  className="text-slate-500 hover:text-slate-700"
                  title="View Info"
                  type="button"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditModal({
                    open: true,
                    project: {
                      ...project,
                      clientId: project.clientId?._id || project.clientId,
                      status: project.status || 'active',
                    },
                  })}
                  className="text-blue-600 hover:text-blue-700"
                  title="Edit Project"
                  type="button"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, projectId: project._id })}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Project"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              <div><span className="font-medium text-slate-800">Client:</span> {project.clientId?.name || 'N/A'}</div>
              <div><span className="font-medium text-slate-800">Status:</span> {project.status || 'active'}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="hidden md:block">
        <Table columns={columns} data={projects} />
      </Card>

      <Popover
        open={infoPopover.open}
        anchorRef={{ current: infoPopover.anchor }}
        onClose={() => setInfoPopover({ open: false, project: null, anchor: null })}
        centerOnMobile
      >
        {infoPopover.project && (
          <div className="space-y-2">
            <div><span className="font-bold">Title:</span> {infoPopover.project.title}</div>
            <div><span className="font-bold">Client:</span> {infoPopover.project.clientId?.name || 'N/A'}</div>
            <div><span className="font-bold">Status:</span> {infoPopover.project.status || 'active'}</div>
            <div>
              <span className="font-bold">Description:</span>{' '}
              {infoPopover.project.description || <span className="italic text-slate-400">None</span>}
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
};
