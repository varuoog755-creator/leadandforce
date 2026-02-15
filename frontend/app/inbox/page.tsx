'use client';

import { useState, useEffect } from 'react';
import {
    MessageSquare, Search, Filter, Star, Archive, Trash2, Reply,
    Linkedin, Instagram, Facebook, ChevronRight, Clock, CheckCheck,
    Send, Paperclip, MoreVertical, User, Loader2
} from 'lucide-react';
import { fetchInboxMessages } from '../../lib/api';

interface Message {
    id: string;
    platform: string;
    username: string;
    sender_name: string;
    sender_profile_url: string;
    message_text: string;
    is_outbound: boolean;
    is_read: boolean;
    thread_id: string;
    created_at: string;
    avatar_color: string;
}

const platformIcons: Record<string, any> = {
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
};

const platformColors: Record<string, string> = {
    linkedin: 'bg-blue-500',
    instagram: 'bg-gradient-to-br from-pink-500 to-purple-600',
    facebook: 'bg-blue-600',
};

const avatarColors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];

const DEMO_MESSAGES: Message[] = [
    { id: '1', platform: 'linkedin', username: 'john.doe@email.com', sender_name: 'Sarah Chen', sender_profile_url: '#', message_text: 'Hi John! Thanks for connecting. I\'d love to learn more about what LeadEnforce offers. Are you available for a quick call this week?', is_outbound: false, is_read: false, thread_id: 'thread-1', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), avatar_color: avatarColors[0] },
    { id: '2', platform: 'linkedin', username: 'john.doe@email.com', sender_name: 'James Wilson', sender_profile_url: '#', message_text: 'Great to be connected! I saw your profile and I think we could collaborate on the SaaS space. Let me know your thoughts.', is_outbound: false, is_read: false, thread_id: 'thread-2', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), avatar_color: avatarColors[1] },
    { id: '3', platform: 'linkedin', username: 'john.doe@email.com', sender_name: 'Emily Davis', sender_profile_url: '#', message_text: 'Thanks for the connection request! Your automation tools look interesting. Do you have any case studies you could share?', is_outbound: false, is_read: true, thread_id: 'thread-3', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), avatar_color: avatarColors[2] },
    { id: '4', platform: 'instagram', username: '@leadenforce_official', sender_name: 'techstartup_io', sender_profile_url: '#', message_text: 'Hey! Loved your latest post about lead generation. Would you be interested in a collab?', is_outbound: false, is_read: true, thread_id: 'thread-4', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), avatar_color: avatarColors[3] },
    { id: '5', platform: 'linkedin', username: 'john.doe@email.com', sender_name: 'Michael Brown', sender_profile_url: '#', message_text: 'Hi John, I noticed you\'re at LeadEnforce. We\'re looking for automation solutions for our sales team. Can we schedule a demo?', is_outbound: false, is_read: true, thread_id: 'thread-5', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), avatar_color: avatarColors[4] },
    { id: '6', platform: 'linkedin', username: 'john.doe@email.com', sender_name: 'Alex Turner', sender_profile_url: '#', message_text: 'Thanks for reaching out! I appreciate the personalized message. Let\'s connect further.', is_outbound: false, is_read: true, thread_id: 'thread-6', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), avatar_color: avatarColors[5] },
];

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedThread, setSelectedThread] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
    const [isLive, setIsLive] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const res = await fetchInboxMessages();
            if (res.data) {
                const msgs = Array.isArray(res.data) ? res.data : res.data.messages || [];
                // Assign avatar colors to messages that don't have them
                const coloredMsgs = msgs.map((m: any, i: number) => ({
                    ...m,
                    avatar_color: m.avatar_color || avatarColors[i % avatarColors.length],
                }));
                setMessages(coloredMsgs);
                setIsLive(true);
                setPageLoading(false);
                return;
            }
        } catch (err) {
            console.log('API unavailable, using demo data');
        }
        setMessages(DEMO_MESSAGES);
        setPageLoading(false);
    };

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.is_read;
        if (searchQuery) return m.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) || m.message_text.toLowerCase().includes(searchQuery.toLowerCase());
        return true;
    });

    const selectedMessage = messages.find(m => m.thread_id === selectedThread);
    const unreadCount = messages.filter(m => !m.is_read).length;

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    const handleMarkRead = (threadId: string) => {
        setMessages(prev => prev.map(m => m.thread_id === threadId ? { ...m, is_read: true } : m));
    };

    return (
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inbox</h1>
                <p className="text-sm text-gray-400 mt-1">{unreadCount} unread messages across all platforms</p>
            </div>

            {/* Inbox Layout */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Message List */}
                <div className={`${selectedThread ? 'w-[380px]' : 'w-full'} border-r border-gray-100 flex flex-col transition-all duration-300`}>
                    {/* Search & Filter */}
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search messages..."
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {[
                                { key: 'all' as const, label: 'All' },
                                { key: 'unread' as const, label: `Unread (${unreadCount})` },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer
                                        ${filter === f.key ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredMessages.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare size={24} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-xs text-gray-400">No messages found</p>
                            </div>
                        ) : (
                            filteredMessages.map(msg => {
                                const PlatformIcon = platformIcons[msg.platform] || Linkedin;
                                return (
                                    <div
                                        key={msg.id}
                                        onClick={() => { setSelectedThread(msg.thread_id); handleMarkRead(msg.thread_id); }}
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 hover:bg-gray-50/50
                                            ${selectedThread === msg.thread_id ? 'bg-violet-50/50 border-l-2 border-l-violet-500' : ''}
                                            ${!msg.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full ${msg.avatar_color} flex items-center justify-center text-white text-xs font-bold`}>
                                                    {msg.sender_name[0]}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${platformColors[msg.platform]} rounded-full flex items-center justify-center border-2 border-white`}>
                                                    <PlatformIcon size={8} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs ${!msg.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                        {msg.sender_name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(msg.created_at)}</span>
                                                </div>
                                                <p className={`text-[11px] leading-relaxed truncate ${!msg.is_read ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                    {msg.message_text}
                                                </p>
                                            </div>
                                            {!msg.is_read && (
                                                <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                {selectedThread && selectedMessage ? (
                    <div className="flex-1 flex flex-col">
                        {/* Thread Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${selectedMessage.avatar_color} flex items-center justify-center text-white text-sm font-bold`}>
                                    {selectedMessage.sender_name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{selectedMessage.sender_name}</p>
                                    <p className="text-[11px] text-gray-400 capitalize">{selectedMessage.platform} · {selectedMessage.username}</p>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Outbound Message (sent by user) */}
                            <div className="flex justify-end">
                                <div className="max-w-[70%] bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-2xl rounded-tr-md px-5 py-3">
                                    <p className="text-xs leading-relaxed">Hi {selectedMessage.sender_name.split(' ')[0]}, I noticed your work in the tech space. Would love to connect and explore potential synergies!</p>
                                    <div className="flex items-center justify-end gap-1 mt-2">
                                        <span className="text-[10px] text-violet-200">Sent</span>
                                        <CheckCheck size={12} className="text-violet-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Inbound Message */}
                            <div className="flex justify-start">
                                <div className="max-w-[70%] bg-gray-50 rounded-2xl rounded-tl-md px-5 py-3">
                                    <p className="text-xs leading-relaxed text-gray-700">{selectedMessage.message_text}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">{formatTime(selectedMessage.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-gray-100">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type a reply..."
                                        rows={1}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 resize-none transition-all"
                                    />
                                </div>
                                <button className="p-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all cursor-pointer flex-shrink-0">
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    !selectedThread && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
                                    <MessageSquare size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Select a conversation</p>
                                <p className="text-xs text-gray-400">Choose a message from the list to view the thread</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
