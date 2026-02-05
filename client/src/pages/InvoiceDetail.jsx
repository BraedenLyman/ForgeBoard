import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Loading, Error, Button, Badge } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import { FileDown } from 'lucide-react';

export const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoiceDetail();
  }, [id]);

  const loadInvoiceDetail = async () => {
    try {
      const data = await api.invoices.getDetail(id);
      setInvoice(data);
    } catch (err) {
      setError(err.error?.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      await api.invoices.update(id, { status: 'paid' });
      loadInvoiceDetail();
    } catch (err) {
      setError(err.error?.message || 'Failed to update invoice');
    }
  };

  const handleDownloadPDF = () => {
    const pdfUrl = api.invoices.getPDF(id);
    window.open(pdfUrl, '_blank');
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!invoice) return <Error message="Invoice not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{invoice.number}</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="secondary">
            <FileDown className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          {invoice.status !== 'paid' && (
            <Button onClick={handleMarkPaid} variant="primary">
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-slate-600">Status</p>
          <Badge color={invoice.status === 'paid' ? 'green' : 'yellow'} className="text-lg">
            {invoice.status.toUpperCase()}
          </Badge>
        </Card>
        <Card>
          <p className="text-slate-600">Amount</p>
          <p className="text-3xl font-bold">${(invoice.totalCents / 100).toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-slate-600">Due Date</p>
          <p className="text-lg font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-600">To</p>
            <p className="font-medium">{invoice.clientId?.name}</p>
            {invoice.clientId?.email && <p className="text-sm">{invoice.clientId.email}</p>}
          </div>
          <div>
            <p className="text-slate-600">Issue Date</p>
            <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Line Items</h2>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="text-right">{item.qty}</td>
                <td className="text-right">${(item.unitPriceCents / 100).toFixed(2)}</td>
                <td className="text-right font-medium">
                  ${((item.qty * item.unitPriceCents) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t pt-4 mt-4 text-right">
          <p className="text-lg font-bold">
            Total: ${(invoice.totalCents / 100).toFixed(2)}
          </p>
        </div>
      </Card>
    </div>
  );
};
