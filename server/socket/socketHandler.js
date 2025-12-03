const User = require('../models/User');

module.exports = (io) => {
    const users = new Map(); // Map userId -> socketId

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // User joins with ID and username
        socket.on('join_with_data', async ({ userId, username }) => {
            users.set(userId, socket.id);
            socket.userId = userId;
            socket.username = username;

            // Update user status in DB
            try {
                await User.findByIdAndUpdate(userId, {
                    status: 'online',
                    lastSeen: new Date()
                });
            } catch (error) {
                console.error('Error updating user status:', error);
            }

            io.emit('user_status_change', { userId, status: 'online' });
            console.log(`User ${username} (${userId}) is online`);
        });

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User joined conversation: ${conversationId}`);
        });

        // Leave a conversation room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        // Send a message to a conversation or group
        socket.on('send_message', (message) => {
            const { conversationId, groupId } = message;
            const room = conversationId || groupId;
            if (room) {
                socket.to(room).emit('new_message', message);
            }
        });

        // Typing indicators
        socket.on('typing', ({ room, username }) => {
            socket.to(room).emit('typing', { room, user: username || socket.username });
        });

        socket.on('stop_typing', (room) => {
            socket.to(room).emit('stop_typing', { room });
        });

        // Get list of online users
        socket.on('get_online_users', () => {
            const onlineUserIds = Array.from(users.keys());
            socket.emit('online_users_list', onlineUserIds);
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            let userId = socket.userId;

            // Fallback if userId not set
            if (!userId) {
                for (const [key, value] of users.entries()) {
                    if (value === socket.id) {
                        userId = key;
                        break;
                    }
                }
            }

            if (userId) {
                users.delete(userId);

                try {
                    await User.findByIdAndUpdate(userId, {
                        status: 'offline',
                        lastSeen: new Date()
                    });
                } catch (error) {
                    console.error('Error updating user lastSeen:', error);
                }

                io.emit('user_status_change', { userId, status: 'offline' });
            }

            console.log('User disconnected:', socket.id);
        });
    });
};
