import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Loading, Error, Badge } from '../components/UI.jsx';
import { api } from '../utils/api.js';

const formatPhone = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientDetail();
  }, [id]);

  const loadClientDetail = async () => {
    try {
      const data = await api.clients.getDetail(id);
      setClient(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load client');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!client) return <Error message="Client not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{client.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Contact Info</h2>
          <p><strong>Email:</strong> {client.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {formatPhone(client.phone) || 'N/A'}</p>
          <p><strong>Company:</strong> {client.company || 'N/A'}</p>
          {client.notes && (
            <p><strong>Notes:</strong> {client.notes}</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <p><strong>Leads:</strong> {client.leads?.length || 0}</p>
          <p><strong>Projects:</strong> {client.projects?.length || 0}</p>
          <p><strong>Invoices:</strong> {client.invoices?.length || 0}</p>
        </Card>
      </div>

      {client.leads && client.leads.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-bold mb-4">Related Leads</h2>
          <div className="space-y-2">
            {client.leads.map((lead) => (
              <div key={lead._id} className="flex justify-between items-center p-2 border-b">
                <span>{lead.title}</span>
                <Badge>{lead.stage}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {client.projects && client.projects.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-bold mb-4">Related Projects</h2>
          <div className="space-y-2">
            {client.projects.map((proj) => (
              <div key={proj._id} className="flex justify-between items-center p-2 border-b">
                <span>{proj.title}</span>
                <Badge color={proj.status === 'active' ? 'green' : 'slate'}>{proj.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
