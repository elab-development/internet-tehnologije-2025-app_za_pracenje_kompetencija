import React from 'react';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-500">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className='text-2xl text-center font-bold mb-6'>Registracija</h2>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Name</label>
          <input type="text" placeholder='Name' className='w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'></input>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Surname</label>
          <input type="text" placeholder='Surname' className='w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'></input>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Email</label>
          <input type="email" placeholder='email@example.com' className='w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'></input>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Password</label>
          <input type="password" placeholder='********' className='w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'></input>
        </div>

        <button type="submit" className='w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition'>Create an account</button>

        <p className='text-sm text-center mt-4'>You already have an account? {' '}
          <Link to="/login" className='text-red-500 underline hover:text-red-600'>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
