import { useRef, useEffect, useState } from 'react';

export const Popover = ({ open, anchorRef, onClose, children, className = '', centerOnMobile = false }) => {
  const popoverRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        (!anchorRef.current || !anchorRef.current.contains(e.target))
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!centerOnMobile) return;
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerOnMobile]);

  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (open && anchorRef.current && !(centerOnMobile && isMobile)) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [open, anchorRef, centerOnMobile, isMobile]);

  if (!open) return null;
  if (centerOnMobile && isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div
          ref={popoverRef}
          className={`relative bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-[90vw] ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[220px] ${className}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </div>
  );
};
export const Button = ({ children, variant = 'primary', disabled, className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors text-center inline-flex items-center justify-center';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <input
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-slate-300'
      }`}
      {...props}
    />
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>{children}</div>
);

export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

export const Table = ({ columns, data, onRowClick }) => (
  <table className="w-full text-sm">
    <thead className="bg-slate-100 border-b">
      <tr>
        {columns.map((col) => (
          <th key={col.key} className="px-4 py-2 text-left font-medium">
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, idx) => (
        <tr
          key={idx}
          className="border-b hover:bg-slate-50 cursor-pointer"
          onClick={() => onRowClick && onRowClick(row)}
        >
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-2">
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-xl text-slate-500">Loading...</div>
  </div>
);

export const Error = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
    <strong>Error:</strong> {message || 'Something went wrong'}
  </div>
);
