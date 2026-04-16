import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getMediaUrl } from '@/lib/media';
import { Send, Search, ArrowLeft, MessageCircle } from 'lucide-react';

const MessagesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('list');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages]);

  const fetchConversations = async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data);
      if (res.data.length > 0 && !selectedConversation && window.innerWidth > 768) {
        setSelectedConversation(res.data[0].conversationId);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await messagesAPI.getConversationMessages(convId);
      const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setSelectedMessages(sorted);
      
      const unreadMessages = sorted.filter(m => !m.read && m.receiverId === user.id);
      if (unreadMessages.length > 0) {
        for (const m of unreadMessages) {
          await messagesAPI.markAsRead(m.id);
        }
        fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (convId) => {
    setSelectedConversation(convId);
    setMobileView('chat');
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const currentConv = conversations.find(c => c.conversationId === selectedConversation);
    if (!currentConv) return;
    try {
      await messagesAPI.send({ receiverId: currentConv.otherUser.id, message: messageInput });
      setMessageInput('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const currentConv = conversations.find(c => c.conversationId === selectedConversation);

  const ConversationList = () => (
    <Card className="border-2 border-orange-200 h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher..." className="pl-10" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Aucune conversation</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv.conversationId)}
                className={`w-full p-4 text-left transition-colors border-b border-gray-50 ${
                  selectedConversation === conv.conversationId 
                    ? 'bg-orange-50 border-l-4 border-orange-500' 
                    : conv.unread 
                      ? 'bg-orange-50/40 hover:bg-orange-100/50' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0 shadow-sm">
                    <AvatarImage src={getMediaUrl(conv.otherUser.avatar)} />
                    <AvatarFallback className="bg-orange-100 text-orange-700">{conv.otherUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`truncate ${conv.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {conv.otherUser.name}
                      </p>
                      {conv.unread && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 ml-2 animate-pulse shadow-sm"></div>}
                    </div>
                    <p className={`text-sm truncate ${conv.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const MessageThread = () => (
    <Card className="border-2 border-orange-200 flex flex-col h-full">
      {currentConv ? (
        <>
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0 rounded-t-lg">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1" onClick={() => setMobileView('list')}>
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Avatar className="h-11 w-11 flex-shrink-0">
                <AvatarImage src={getMediaUrl(currentConv.otherUser.avatar)} />
                <AvatarFallback className="bg-orange-100 text-orange-700">{currentConv.otherUser.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{currentConv.otherUser.name}</p>
                <p className="text-xs text-green-600">En ligne</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {selectedMessages.map((msg) => {
              const isCurrentUser = msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-br-sm shadow-md'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isCurrentUser ? 'text-white/75' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 rounded-b-lg">
            <div className="flex gap-2">
              <Input
                placeholder="Écrire un message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
          <MessageCircle className="h-12 w-12 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">Sélectionnez une conversation pour commencer</p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.nav.messages}</h1>
        <div className="hidden md:grid md:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="md:col-span-1"><ConversationList /></div>
          <div className="md:col-span-2"><MessageThread /></div>
        </div>
        <div className="md:hidden" style={{ height: 'calc(100vh - 180px)' }}>
          {mobileView === 'list' ? <ConversationList /> : <MessageThread />}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
