

export class Spotify {

    constructor() {

        this.accessToken = this.getAccessToken();
        this.clientID = "8ed9e434e8634706bc3356617bf4a100";
        this.redirectURL = 'http://localhost:3000/';
        //redirectURL: "https://thats_my_jam.surge.sh"

        this.getAccessToken = this.getAccessToken.bind(this);
        this.search = this.search.bind(this);
        this.savePlaylist = this.savePlaylist(this);
    }

    getAccessToken() {
        if (this.accessToken !== undefined && this.accessToken !== '') {
            return this.accessToken;

        } else if (window.location.href.includes('access_token=')) {
            this.accessToken = window.location.href.match(/access_token=([^&]*)/)[0];
            let expirationTime = window.location.href.match(/expires_in=([^&]*)/)[0];

            window.setTimeout(() => this.accessToken = '', expirationTime * 1000);
            window.history.pushState('Access Token', null, '/');

        } else {
            window.location.href = "https://accounts.spotify.com/authorize" +
                `?client_id=${this.clientID}` +
                `&redirect_uri=${this.redirectURL}` +
                "&scope=playlist-modify-public" +
                "&response_type=token";
        }
    }

    async search(searchTerm) {
        try {
            const endpoint = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
            const requestSearchResults = await fetch(endpoint, {
                headers: {'Authorization': `Bearer ${this.getAccessToken()}`}
            });
            if (requestSearchResults.ok) {
                const jsonResponse = await requestSearchResults.json();
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
    }

    async savePlaylist(playlistName, trackURIs) {
        if (playlistName === '' || (trackURIs === undefined || trackURIs.length === 0)) {
            return;
        }

        let userID = '';
        let playlistID = '';

        try {
            const requestID = await fetch(`https://api.spotify.com/v1/me`, {
                headers: {'Authorization': `Bearer ${this.getAccessToken()}`},
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
                headers: {'Authorization': `Bearer ${this.getAccessToken()}`},
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
                headers: {'Authorization': `Bearer ${this.getAccessToken()}`},
                body: {
                    uris: trackURIs
                }
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
}




