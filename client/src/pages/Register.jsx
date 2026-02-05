import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Error, Card } from '../components/UI.jsx';
import { api } from '../utils/api.js';
import logo from '../assets/logo.png';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.register({ name, email, password });
      navigate('/app');
    } catch (err) {
      setError(err.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <button
          onClick={() => navigate('/')}
          className="text-slate-600 hover:text-blue-600 text-sm flex items-center mb-4"
          type="button"
          aria-label="Back to landing"
        >
          ← Back
        </button>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-7">
            <img src={logo} alt="ForgeBoard" className="h-[48px] sm:h-[56px] w-auto max-w-full" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold mt-2">Create Account</h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Start organizing your freelance business in minutes.
          </p>
        </div>

        {error && <Error message={error} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};
