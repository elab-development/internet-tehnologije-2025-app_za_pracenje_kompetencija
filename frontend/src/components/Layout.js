import React from 'react';
import Navbar from './Navbar';

function Layout({childern}){
    return(
        <div>
            <Navbar />
            <main style={{padding: '20px'}}>
                {childern}
            </main>
        </div>
    );
};

export default Layout;