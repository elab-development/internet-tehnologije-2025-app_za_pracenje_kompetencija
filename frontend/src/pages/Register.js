import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate(); // ✅ poziva se OVDE, na vrhu komponente

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({}); // validacija greške

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({}); // resetujemo greške pre svakog slanja

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/register', {
        name,
        surname,
        email,
        password
      });

      console.log('User created: ', res.data);

      alert('Registration successful! You can now log in.');

      navigate('/login'); 

    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data.errors || { general: error.response.data.message });
      } else {
        setErrors({ general: 'Something went wrong!' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-500">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl text-center font-bold mb-6">Registration</h2>

        {errors.general && (
          <p className="text-red-500 text-sm mb-4">{errors.general}</p>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Name"
              className="w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Surname</label>
            <input
              type="text"
              placeholder="Surname"
              className="w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={surname}
              onChange={e => setSurname(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {/* <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="guest">Guest</option>
            </select>
          </div> */}

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Create an account
          </button>

          <p className="text-sm text-center mt-4">
            You already have an account?{' '}
            <Link to="/login" className="text-red-500 underline hover:text-red-600">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
