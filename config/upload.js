module.exports.upload = {
    avatar: {
        ext: ['image/jpeg', 'image/png'],
        directory: __dirname + '/../uploads/avatars'
    },

    message: {
        image: {
            ext: ['image/jpeg', 'image/png'],
            directory: __dirname + '/../uploads/content_images'
        },
        audio: {
            ext: ['audio/mpeg'],
            directory: __dirname + '/../uploads/content_audios'
        },
        video: {
            directory: __dirname + '/../uploads/content_videos'
        },
        binary: {
            directory: __dirname + '/../uploads/content_binary'
        }
    }

};
