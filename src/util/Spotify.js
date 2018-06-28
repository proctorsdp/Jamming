let accessToken = null;
const clientID = "8ed9e434e8634706bc3356617bf4a100";
const redirectURL = 'http://localhost:3000/';
//const redirectURL = "https://thats_my_jam.surge.sh";

export const Spotify = {

    getAccessToken: function() {
        if (accessToken !== null) {
            return accessToken;

        } else if (window.location.href.includes('access_token=')) {
            accessToken = window.location.href.match(/access_token=([^&]*)/)[0];
            let expirationTime = window.location.href.match(/expires_in=([^&]*)/)[0];

            if (accessToken !== null && expirationTime !== null) {
                accessToken = accessToken.split('=')[1];
                expirationTime = expirationTime.split('=')[1];

                window.setTimeout(() => accessToken = '', expirationTime * 1000);
                window.history.pushState('Access Token', null, '/');
            }

        } else {
            window.location.href = "https://accounts.spotify.com/authorize" +
                `?client_id=${clientID}` +
                `&redirect_uri=${redirectURL}` +
                "&scope=playlist-modify-public" +
                "&response_type=token";
        }
    },

    search: function(searchTerm) {
        try {
            const endpoint = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
            const requestSearchResults = fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${this.getAccessToken}` }
            });
            if (requestSearchResults.ok) {
                const jsonResponse = requestSearchResults.json();
                if (jsonResponse.tracks !== undefined) {
                    return jsonResponse.tracks.map(track => {
                        return {
                            id: track.id,
                            name: track.name,
                            artist: track.artists[0].name,
                            album: track.album.name,
                            uri: track.uri
                        }
                    });
                }
                return [];
            }
            throw new Error('Request Failed!');
        }
        catch (e) {
            console.log(e);
        }
    },

    savePlaylist: async function(playlistName, trackURIs) {
        if (playlistName === '' || (trackURIs === undefined || trackURIs.length === 0)) {
            return;
        }

        const header = { 'Authorization': `Bearer ${this.getAccessToken}` };
        let userID = '';
        let playlistID = '';

        try {
            const requestID = await fetch(`https://api.spotify.com/v1/me`, {
                headers: header
            });
            if (requestID.ok) {
                const jsonIDResponse = await requestID.json();
                userID = jsonIDResponse.id;
            }
            throw new Error('Request Failed!');
        }
        catch (e) {
            console.log(e);
        }

        try {
            const postPlaylist = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                method: 'POST',
                headers: header,
                body: {
                    'name': playlistName,
                    'description': '',
                    'public': false
                }
            });
            if (postPlaylist.ok) {
                const jsonPlaylistResponse = await postPlaylist.json();
                playlistID = jsonPlaylistResponse.id;
            }
            throw new Error('Request Failed!');
        }
        catch (e) {
            console.log(e);
        }

        try {
            const postTracks = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                method: 'POST',
                headers: header,
                body: { uris: trackURIs }
            });
            if (postTracks.ok) {
                return;
            }
            throw new Error('Request Failed!');
        }
        catch (e) {
            console.log(e);
        }
    }
};
