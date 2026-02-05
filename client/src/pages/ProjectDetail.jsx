import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Loading, Error, Button, Input, Badge, Table } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { Plus, Trash2 } from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'med' });
  const [timeForm, setTimeForm] = useState({ date: '', minutes: '' });

  useEffect(() => {
    loadProjectDetail();
  }, [id]);

  const loadProjectDetail = async () => {
    try {
      const data = await api.projects.getDetail(id);
      setProject(data);
      setTasks(data.tasks || []);
      setTimeLogs(data.timeLogs || []);
    } catch (err) {
      setError(err.error?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.projects.tasks.create(id, taskForm);
      setTaskForm({ title: '', priority: 'med' });
      setShowTaskForm(false);
      loadProjectDetail();
    } catch (err) {
      setError(err.error?.message || 'Failed to create task');
    }
  };

  const handleAddTimeLog = async (e) => {
    e.preventDefault();
    try {
      await api.projects.timeLogs.create(id, timeForm);
      setTimeForm({ date: '', minutes: '' });
      setShowTimeForm(false);
      loadProjectDetail();
    } catch (err) {
      setError(err.error?.message || 'Failed to create time log');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.projects.tasks.delete(id, taskId);
        loadProjectDetail();
      } catch (err) {
        setError(err.error?.message || 'Failed to delete task');
      }
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!project) return <Error message="Project not found" />;

  const totalHours = project.totalMinutes ? (project.totalMinutes / 60).toFixed(1) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-slate-600">Status</p>
          <p className="text-2xl font-bold capitalize">{project.status}</p>
        </Card>
        <Card>
          <p className="text-slate-600">Total Hours</p>
          <p className="text-2xl font-bold">{totalHours}h</p>
        </Card>
        <Card>
          <p className="text-slate-600">Tasks</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </Card>
        <Card>
          <p className="text-slate-600">Revenue</p>
          <p className="text-2xl font-bold">${(project.totalCents / 100).toFixed(0)}</p>
        </Card>
      </div>

      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tasks</h2>
          <Button onClick={() => setShowTaskForm(!showTaskForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>

        {showTaskForm && (
          <form onSubmit={handleAddTask} className="mb-4 p-4 bg-slate-50 rounded">
            <Input
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Button type="submit">Create Task</Button>
          </form>
        )}

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task._id} className="flex justify-between items-center p-3 border rounded bg-slate-50">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-slate-600">{task.status}</p>
              </div>
              <div className="flex gap-2">
                <Badge color={task.priority === 'high' ? 'red' : task.priority === 'med' ? 'yellow' : 'blue'}>
                  {task.priority}
                </Badge>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Time Logs</h2>
          <Button onClick={() => setShowTimeForm(!showTimeForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Log Time
          </Button>
        </div>

        {showTimeForm && (
          <form onSubmit={handleAddTimeLog} className="mb-4 p-4 bg-slate-50 rounded">
            <Input
              label="Date"
              type="date"
              value={timeForm.date}
              onChange={(e) => setTimeForm({ ...timeForm, date: e.target.value })}
              required
            />
            <Input
              label="Minutes"
              type="number"
              value={timeForm.minutes}
              onChange={(e) => setTimeForm({ ...timeForm, minutes: e.target.value })}
              required
            />
            <Button type="submit">Add Time Log</Button>
          </form>
        )}

        <div className="space-y-2">
          {timeLogs.map((log) => (
            <div key={log._id} className="flex justify-between items-center p-3 border-b">
              <div>
                <p className="font-medium">{new Date(log.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600">{log.minutes} minutes</p>
              </div>
              {log.note && <p className="text-sm text-slate-500">{log.note}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
