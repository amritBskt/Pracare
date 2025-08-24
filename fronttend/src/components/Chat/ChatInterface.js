import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Send, Bot, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../../services/api';

const ChatInterface = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentSessionId) {
      fetchSessionMessages();
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessionMessages = async () => {
    try {
      const response = await api.get(`/chat/sessions/${currentSessionId}/`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load chat history');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: Date.now(),
      message_type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const payload = { message: userMessage };
      if (currentSessionId) {
        payload.session_id = currentSessionId;
      }

      const response = await api.post('/chat/send/', payload);

      // const response = await api.post('/chat/send/', {
      //   session_id: currentSessionId,
      //   message: userMessage,
      // });

      const { session_id, user_message, ai_response } = response.data;
      
      if (!currentSessionId) {
        setCurrentSessionId(session_id);
      }

      // Replace temp message with actual messages from server
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [
          ...withoutTemp,
          {
            id: user_message.id,
            message_type: 'user',
            content: user_message.content,
            timestamp: user_message.timestamp,
          },
          {
            id: ai_response.id,
            message_type: 'assistant',
            content: ai_response.content,
            timestamp: ai_response.timestamp,
          }
        ];
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-indigo-600 text-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Pracare Chat Assistant</h1>
        <p className="text-indigo-100 text-sm">
          I'm here to provide empathetic support and guidance
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm">
              Share what's on your mind. I'm here to listen and support you.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.message_type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.message_type === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
            )}
            
            <div
              className={`max-w-md px-4 py-2 rounded-lg ${
                message.message_type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.message_type === 'user' 
                    ? 'text-indigo-200' 
                    : 'text-gray-500'
                }`}
              >
                {format(new Date(message.timestamp), 'HH:mm')}
              </p>
            </div>

            {message.message_type === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
