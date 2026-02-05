import { useEffect, useState } from 'react';
import { Card, Loading, Error, Table, Modal, Input, Button } from '../components/UI.jsx';
import { api } from '../utils/api.js';

export const TimeLogs = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [timeForm, setTimeForm] = useState({
    projectId: '',
    date: '',
    hours: '',
    rate: '',
    note: '',
  });

  useEffect(() => {
    const loadTimeLogs = async () => {
      try {
        const [logs, projectsData] = await Promise.all([
          api.timeLogs.getAll(),
          api.projects.getAll(),
        ]);
        setTimeLogs(logs);
        setProjects(projectsData);
      } catch (err) {
        setError(err.error?.message || 'Failed to load time logs');
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeLogs();
  }, []);

  if (isLoading) return <Loading />;

  const formatHours = (minutes) => (minutes / 60).toFixed(2);

  const calcRate = (log) => {
    const rateCents = log.rateCents ?? log.projectId?.hourlyRateCents ?? 0;
    return (rateCents / 100).toFixed(2);
  };

  const calcTotal = (log) => {
    const rateCents = log.rateCents ?? log.projectId?.hourlyRateCents ?? 0;
    return ((rateCents * log.minutes) / 6000).toFixed(2);
  };

  const columns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'hours', label: 'Hours', render: (row) => formatHours(row.minutes) },
    { key: 'rate', label: 'Rate', render: (row) => `$${calcRate(row)}` },
    { key: 'total', label: 'Total', render: (row) => `$${calcTotal(row)}` },
    { key: 'note', label: 'Note', render: (row) => row.note || '—' },
  ];

  const projectsByClient = timeLogs.reduce((acc, log) => {
    const clientId = log.projectId?.clientId?._id || 'unknown';
    const clientName = log.projectId?.clientId?.name || 'Unknown Client';
    const projectId = log.projectId?._id || 'unknown-project';
    const projectTitle = log.projectId?.title || 'Unknown Project';

    if (!acc[clientId]) {
      acc[clientId] = { clientName, projects: {} };
    }
    if (!acc[clientId].projects[projectId]) {
      acc[clientId].projects[projectId] = { projectTitle, logs: [] };
    }
    acc[clientId].projects[projectId].logs.push(log);
    return acc;
  }, {});

  const projectTotal = (logs) =>
    logs.reduce((sum, log) => sum + Number(calcTotal(log)), 0).toFixed(2);
  const projectHours = (logs) =>
    logs.reduce((sum, log) => sum + log.minutes, 0) / 60;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sticky top-16 z-40 -mx-4 px-4 pt-4 pb-3 bg-slate-50/95 backdrop-blur border-b flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-center sm:text-left">Time Logs</h1>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">Log Time</Button>
      </div>

      {error && <Error message={error} />}

      <div className="md:hidden space-y-4">
        {Object.entries(projectsByClient).map(([clientKey, clientGroup]) => (
          <Card key={clientKey} className="p-4">
            <div className="font-semibold text-slate-900 mb-3">{clientGroup.clientName}</div>
            <div className="space-y-3">
              {Object.entries(clientGroup.projects).map(([projectKey, projectGroup]) => (
                <Card key={projectKey} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-900">{projectGroup.projectTitle}</div>
                  </div>
                  <div className="space-y-2">
                    {projectGroup.logs.map((log) => (
                      <div key={log._id} className="text-sm text-slate-600 border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span>{new Date(log.date).toLocaleDateString()}</span>
                          <span>{formatHours(log.minutes)}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>${calcRate(log)}/hr</span>
                          <span className="font-medium text-slate-900">${calcTotal(log)}</span>
                        </div>
                        {log.note && <div className="text-xs text-slate-500 mt-1">{log.note}</div>}
                      </div>
                    ))}
                    <div className="border-t border-slate-400 pt-2 text-sm flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        Project Total ({projectHours(projectGroup.logs).toFixed(2)}h)
                      </span>
                      <span className="font-semibold text-slate-900">${projectTotal(projectGroup.logs)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden md:block space-y-6">
        {Object.entries(projectsByClient).map(([clientKey, clientGroup]) => (
          <Card key={clientKey} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-slate-900">{clientGroup.clientName}</div>
            </div>
            <div className="space-y-4">
              {Object.entries(clientGroup.projects).map(([projectKey, projectGroup]) => (
                <Card key={projectKey} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-slate-900">{projectGroup.projectTitle}</div>
                  </div>
                  <Table columns={columns} data={projectGroup.logs} />
                  <div className="border-t border-slate-400 pt-3 text-sm flex justify-between items-center">
                    <span className="font-medium text-slate-700">
                      Project Total ({projectHours(projectGroup.logs).toFixed(2)}h)
                    </span>
                    <span className="font-semibold text-slate-900">${projectTotal(projectGroup.logs)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFormError(''); }} title="Log Time">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError('');
            if (!timeForm.projectId || !timeForm.date || timeForm.hours === '') {
              setFormError('Project, date, and hours are required');
              return;
            }
            try {
              const minutes = Math.round(Number(timeForm.hours) * 60);
              await api.projects.timeLogs.create(timeForm.projectId, {
                date: timeForm.date,
                minutes,
                rateCents: timeForm.rate === '' ? undefined : Math.round(Number(timeForm.rate) * 100),
                note: timeForm.note,
              });
              const logs = await api.timeLogs.getAll();
              setTimeLogs(logs);
              setTimeForm({ projectId: '', date: '', hours: '', rate: '', note: '' });
              setIsModalOpen(false);
            } catch (err) {
              setFormError(err.error?.message || 'Failed to add time log');
            }
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Project</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              value={timeForm.projectId}
              onChange={(e) => setTimeForm({ ...timeForm, projectId: e.target.value })}
              required
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={timeForm.date}
            onChange={(e) => setTimeForm({ ...timeForm, date: e.target.value })}
            required
          />
          <Input
            label="Hours"
            type="number"
            step="0.25"
            value={timeForm.hours}
            onChange={(e) => setTimeForm({ ...timeForm, hours: e.target.value })}
            required
          />
          <Input
            label="Rate ($/hr) (optional)"
            type="number"
            step="0.01"
            value={timeForm.rate}
            onChange={(e) => setTimeForm({ ...timeForm, rate: e.target.value })}
          />
          <Input
            label="Note (optional)"
            value={timeForm.note}
            onChange={(e) => setTimeForm({ ...timeForm, note: e.target.value })}
          />
          {formError && <Error message={formError} />}
          <Button type="submit" className="w-full">Add Time Log</Button>
        </form>
      </Modal>
    </div>
  );
};
