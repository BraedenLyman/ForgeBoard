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

  const handleDownloadPDF = async () => {
    try {
      const blob = await api.invoices.getPDFBlob(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setError(err.error?.message || 'Failed to download PDF');
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!invoice) return <Error message="Invoice not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold">{invoice.number}</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownloadPDF}
            variant="secondary"
            className="text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2 inline-flex items-center justify-center text-center"
          >
            <FileDown className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          {invoice.status !== 'paid' && (
            <Button
              onClick={handleMarkPaid}
              variant="primary"
              className="text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2 inline-flex items-center justify-center text-center"
            >
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-slate-600">Status</p>
          <Badge
            color={invoice.status === 'paid' ? 'green' : invoice.status === 'sent' ? 'yellow' : 'blue'}
            className="text-lg"
          >
            {invoice.status.toUpperCase()}
          </Badge>
        </Card>
        <Card>
          <p className="text-slate-600">Amount</p>
          <p className="font-bold tracking-tight whitespace-nowrap max-w-full truncate text-[clamp(1.25rem,3vw,1.875rem)]">
            ${ (invoice.totalCents / 100).toFixed(2) }
          </p>
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

        <div className="md:hidden space-y-3">
          {invoice.lineItems.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3">
              <div className="font-medium text-slate-900 mb-2">{item.description}</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                <div><span className="font-medium text-slate-800">Qty:</span> {item.qty}</div>
                <div><span className="font-medium text-slate-800">Unit:</span> ${(item.unitPriceCents / 100).toFixed(2)}</div>
                <div className="col-span-2 text-right font-semibold text-slate-900">
                  ${((item.qty * item.unitPriceCents) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
          <div className="border-t pt-3 text-right">
            <p className="text-base font-bold">Total: ${(invoice.totalCents / 100).toFixed(2)}</p>
          </div>
        </div>

        <div className="hidden md:block">
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
        </div>
      </Card>
    </div>
  );
};
