import './App.css';
import { useEffect, useState } from 'react';
import { webSocket } from 'rxjs/webSocket';
import { Auth } from './components/Auth';
import { createContext } from 'react';
import { CreateRoom } from './components/CreateRoom';
import { Rooms } from './components/Rooms';
import { JoinRoom } from './components/JoinRoom';
import { Room } from './components/Room';
import { useReducer } from 'react';

export const AppContext = createContext({});

const initialState = { onlineUsers: [], messages: [], rooms: [] };

const reducer = (state, action) => {
    if (action.type === 'users') {
        return { ...state, onlineUsers: action.payload };
    }
    if (action.type === 'user') {
        return {
            ...state,
            onlineUsers: [...state.onlineUsers, action.payload],
        };
    }
    if (action.type === 'disconnect') {
        const filteredUsers = state.onlineUsers.filter(
            (u) => u.id !== action.payload.id
        );
        return {
            ...state,
            onlineUsers: filteredUsers,
        };
    }
    if (action.type === 'messages') {
        return { ...state, messages: action.payload };
    }
    if (action.type === 'message') {
        return { ...state, messages: [...state.messages, action.payload] };
    }

    if (action.type === 'rooms') {
        return { ...state, rooms: action.payload };
    }
    if (action.type === 'room') {
        return { ...state, rooms: [...state.rooms, action.payload] };
    }
    if (action.type === 'roomUpdate') {
        const newRooms = [...state.rooms];
        const index = state.rooms.findIndex((r) => r.id === action.payload.id);
        newRooms[index] = action.payload;
        return { ...state, rooms: newRooms };
    }
    if (action.type === 'leftRoom') {
        const filteredRooms = state.rooms.filter(
            (r) => r.id !== action.payload.id
        );
        return { ...state, rooms: filteredRooms };
    }
};

function App() {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [roomUsers, setRoomUsers] = useState([]);
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (!user) {
            socket?.unsubscribe();
            return socket?.complete();
        }

        const ws = webSocket('ws://localhost:5000/jwt=' + user);
        ws.subscribe((data) => {
            console.log(data);
            if (data.type === 'connection') {
                return dispatch({ type: 'user', payload: data.payload });
            }
            if (data.type === 'onlineUsers') {
                return dispatch({ type: 'users', payload: data.payload });
            }
            if (data.type === 'disconnect') {
                return dispatch({ type: 'disconnect', payload: data.payload });
            }
            if (data.type === 'message') {
                return dispatch({ type: 'message', payload: data.payload });
            }
            if (data.type === 'roomUpdate') {
                setRoom(data.payload);
            }
            if (data.type === 'joinedRoom') {
                return dispatch({ type: 'room', payload: data.payload });
            }
            if (data.type === 'leftRoom') {
                setRoom(null);
                return dispatch({ type: 'leftRoom', payload: data.payload });
            }
        });

        setSocket(ws);
    }, [user]);

    return (
        <AppContext.Provider
            value={{
                socket,
                user,
                rooms: state.rooms,
                room,
                roomUsers,
                messages: state.messages,
                onlineUsers: state.onlineUsers,
                setUser,
                setRoom,
                setRoomUsers,
                dispatch,
            }}
        >
            <div className="App">
                {!user && <Auth />}{' '}
                {user && (
                    <>
                        {' '}
                        <button
                            onClick={() => {
                                socket.complete();
                                setUser(null);
                            }}
                        >
                            Logout
                        </button>
                        <div className="flex">
                            <div>
                                <CreateRoom />
                                <Rooms />
                                <JoinRoom />
                            </div>
                            {room && <Room />}
                        </div>
                    </>
                )}
            </div>
        </AppContext.Provider>
    );
}

export default App;
