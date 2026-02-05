import { useEffect, useState } from 'react';
import { Button, Card, Loading, Error, Modal, Input, Popover } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Trash2, Edit2, Info } from 'lucide-react';
import { useRef } from 'react';

const stages = ['lead', 'contacted', 'proposal', 'won', 'lost'];

export const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    source: 'direct',
    notes: '',
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, leadId: null });
  const [editModal, setEditModal] = useState({ open: false, lead: null });
  const [infoPopover, setInfoPopover] = useState({ open: false, lead: null, anchor: null });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await api.leads.getAll();
      setLeads(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.leads.create({
        ...formData,
        valueCents: Math.round(formData.value * 100),
      });
      setIsModalOpen(false);
      setFormData({ title: '', value: 0, source: 'direct', notes: '' });
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to create lead');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.leads.delete(id);
      setDeleteModal({ open: false, leadId: null });
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to delete lead');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // Ensure value is a number
      const value = typeof editModal.lead.value === 'string' ? parseFloat(editModal.lead.value) : editModal.lead.value;
      await api.leads.update(editModal.lead._id, {
        title: editModal.lead.title,
        valueCents: Math.round(Number(value) * 100),
        source: editModal.lead.source,
        notes: editModal.lead.notes,
        stage: editModal.lead.stage,
      });
      setEditModal({ open: false, lead: null });
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to update lead');
    }
  };

  const handleStageChange = async (leadId, newStage) => {
    try {
      await api.leads.updateStage(leadId, newStage);
      loadLeads();
    } catch (err) {
      setError(err.error?.message || 'Failed to update lead');
    }
  };

  if (isLoading) return <Loading />;

  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads Pipeline</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />New Lead</span>
        </Button>
      </div>

      {error && <Error message={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Lead">
        <form onSubmit={handleCreateLead}>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Value ($)"
            type="number"
            value={formData.value}
            min={0}
            step={0.01}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
            required
          />
          <Input
            label="Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Button type="submit" className="w-full">
            Create Lead
          </Button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, leadId: null })} title="Delete Lead?">
        <div className="mb-4">Are you sure you want to delete this lead? This action cannot be undone.</div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => handleDelete(deleteModal.leadId)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, leadId: null })}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, lead: null })} title="Edit Lead">
        {editModal.lead && (
          <form onSubmit={handleEdit}>
            <Input
              label="Title"
              value={editModal.lead.title}
              onChange={(e) => setEditModal({ ...editModal, lead: { ...editModal.lead, title: e.target.value } })}
              required
            />
            <Input
              label="Value ($)"
              type="number"
              value={editModal.lead.value}
              min={0}
              step={0.01}
              onChange={(e) => setEditModal({ ...editModal, lead: { ...editModal.lead, value: parseFloat(e.target.value) } })}
              required
            />
            <Input
              label="Source"
              value={editModal.lead.source}
              onChange={(e) => setEditModal({ ...editModal, lead: { ...editModal.lead, source: e.target.value } })}         
            />
            <Input
              label="Notes"
              value={editModal.lead.notes}
              onChange={(e) => setEditModal({ ...editModal, lead: { ...editModal.lead, notes: e.target.value } })}
            />
            <select
              className="w-full mb-4 px-2 py-1 border rounded text-sm"
              value={editModal.lead.stage}
              onChange={(e) => setEditModal({ ...editModal, lead: { ...editModal.lead, stage: e.target.value } })}
            >
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <Card key={stage} className="p-0 flex flex-col">
            <div className="bg-slate-100 px-4 py-3 rounded-t-lg border-b">
              <h2 className="font-bold text-lg capitalize text-center">{stage}</h2>
            </div>
            <div className="flex-1 divide-y">
              {leadsByStage[stage].length === 0 && (
                <div className="p-4 text-slate-400 text-center">No leads</div>
              )}
              {leadsByStage[stage].map((lead) => (
                <div key={lead._id} className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 group">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">{lead.title}</span>
                    <div className="flex gap-2">
                      <button
                        ref={el => {
                          if (infoPopover.open && infoPopover.lead && infoPopover.lead._id === lead._id) infoPopover.anchor = el;
                        }}
                        onClick={e => setInfoPopover({ open: true, lead, anchor: e.currentTarget })}
                        className="text-slate-500 opacity-0 group-hover:opacity-100 transition"
                        title="View Info"
                        type="button"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditModal({ open: true, lead: { ...lead, value: (lead.valueCents / 100).toFixed(2) } })}
                        className="text-blue-500 opacity-0 group-hover:opacity-100 transition"
                        title="Edit Lead"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, leadId: lead._id })}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Popover
                      open={infoPopover.open}
                      anchorRef={{ current: infoPopover.anchor }}
                      onClose={() => setInfoPopover({ open: false, lead: null, anchor: null })}
                    >
                      {infoPopover.lead && (
                        <div className="space-y-2">
                          <div><span className="font-bold">Title:</span> {infoPopover.lead.title}</div>
                          <div><span className="font-bold">Value:</span> ${ (infoPopover.lead.valueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</div>
                          <div><span className="font-bold">Source:</span> {infoPopover.lead.source}</div>
                          <div><span className="font-bold">Stage:</span> {infoPopover.lead.stage}</div>
                          <div><span className="font-bold">Notes:</span> {infoPopover.lead.notes || <span className="italic text-slate-400">None</span>}</div>
                        </div>
                      )}
                    </Popover>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Value: ${ (lead.valueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</span>
                    <span>Source: {lead.source}</span>
                  </div>
                  <select
                    className="w-full mt-2 px-2 py-1 border rounded text-sm"
                    value={lead.stage}
                    onChange={(e) => handleStageChange(lead._id, e.target.value)}
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
