import React, { useState } from 'react';
import axios from 'axios';
import './ChatComponent.css';

const ChatComponent = () => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const sendMessage = async () => {
    let response;

    // Determine which API to call based on the message
    if (message.includes('weather')) {
      response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/weather`, { params: { city: message.split(' ').pop() } });
    } else if (message.includes('Pinterest')) {
      response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/pinterest`, { params: { query: message.split(' ').pop() } });
    } else if (message.includes('restaurant')) {
      response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/restaurant`, { params: { location: message.split(' ').pop() } });
    } else {
      response = await axios.post('/api/chat', { message });
    }

    setChatLog([...chatLog, { message, response: response.data }]);
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-log">
        {chatLog.map((chat, index) => (
          <div key={index}>
            <div className="user-message">{chat.message}</div>
            <div className="bot-response">{chat.response}</div>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
