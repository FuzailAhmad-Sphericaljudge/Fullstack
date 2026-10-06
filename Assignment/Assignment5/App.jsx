import {useState} from 'react';
const App = () => {
    const [search , setSearch ]=useState('');

    const documents=[
        {
            name: "FSD",
            file: "FSD.pdf",
        },
        {
            name: "React",
            file: "React.pdf",
        },
    ]
    