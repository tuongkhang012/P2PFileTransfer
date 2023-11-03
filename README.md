# P2P FILE TRANSFERING PROJECT

## Project setup
Install all necessary dependencies for `server` and `client-vue`.
```
cd client-vue
npm install
cd ../server
npm install
```

## Run project

Firstly, change the value of `VUE_APP_SOCKET_ADDRESS` in `.env` into your hosting computer's IP address.
```
cd client-vue
npm run dev
```
The client website is hosting at `http://<YOUR-IP-ADDRESS>:8080`.

The server is hosting at `http://<YOUR-IP-ADDRESS>:3000`.

To close it, use `Ctrl+C` in your cmd to terminate both process.

## Notes

This can only be use in LAN networks. Larger files above 1GB have not proven to be efficiency.