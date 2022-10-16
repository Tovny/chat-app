import './App.css';
import { useEffect, useState } from 'react';
import { webSocket } from 'rxjs/webSocket';
import { Auth } from './components/Auth';
import { createContext } from 'react';

export const AppContext = createContext({});

function App() {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState(null);
    const [roomUsers, setRoomUsers] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!user) {
            socket?.unsubscribe();
            return socket?.complete();
        }

        const ws = webSocket('ws://localhost:5000/jwt=' + user);
        ws.subscribe((data) => {});

        setSocket(ws);
    }, [user]);

    return (
        <AppContext.Provider
            value={{
                socket,
                user,
                rooms,
                room,
                roomUsers,
                messages,
                setUser,
                setRoom,
                setRoomUsers,
                setMessages,
            }}
        >
            <div className="App">{!user && <Auth />}</div>
        </AppContext.Provider>
    );
}

export default App;
