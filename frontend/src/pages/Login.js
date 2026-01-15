import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        //ako se uloguje ide na dash
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-red-500">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className='text-2xl font-bold text-center mb-6'>Login</h2>

                <form onSubmit={handleLogin}>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Email</label>
                        <input type='email' placeholder="email@example.com" className='w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'></input>
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1'>Password</label>
                        <input type='password' placeholder='********' className='w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'></input>
                    </div>
                    <button type='submit' className='w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition'>Login</button>

                    <p className=' text-sm  text-center mt-4'>You don't have an account?{' '}
                        <Link to="/register" className='text-red-500 underline hover:text-red-600'>Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;