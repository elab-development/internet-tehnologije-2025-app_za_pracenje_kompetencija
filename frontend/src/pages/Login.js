import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/login', {
                email,
                password
            }
            );

            console.log('Logged in user: ', res.data); // { id, email, role }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('user_id', res.data.user.id);          // Da URL ne bude više 'null' 
            localStorage.setItem('user_name', res.data.user.name);      // Da Dashboard zna ime 
            localStorage.setItem('user_surname', res.data.user.surname); // Da Dashboard zna prezime
            localStorage.setItem('user_email', res.data.user.email);    // Da Dashboard zna email 
            localStorage.setItem('user_description', res.data.user.description || ''); // Da Dashboard zna opis

            alert("Login successful!");

            navigate('/dashboard');

        } catch (error) {
            console.log(error.response?.data);
            setError(error.response?.data?.message || 'Something went wrong!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-red-500">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className='text-2xl font-bold text-center mb-6'>Login</h2>

                {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className='block text-sm font-medium mb-1'>Email</label>
                        <input
                            type='email'
                            className='w-full border px-3 py-2'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1'>Password</label>
                        <input
                            type='password'
                            className='w-full border px-3 py-2'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type='submit'
                        className='w-full py-2 bg-red-500 text-white rounded-md'
                    >Login</button>

                    <p className='text-sm text-center'>
                        You don't have an account?{' '}
                        <Link to="/register" className='text-red-500 underline'>
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
