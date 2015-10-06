# Running

```
$ npm install
$ node server.js
```

# Testing Operation

Open 3 Chrome windows, side by side. At each one open the following address:

```
http://localhost:3000
```

- Connect to a cluster HiveMQ setup at each Chrome instance with a different username: For example; user1, user2, user3
- For user1 and user2 refresh the browser window quickly, and leave the user3 alone.
- Perform the browser refresh quickly for user1 and user2 subsequently (more than 10 times)
- At any time, when you leave the browsers alone, eventually you should see all users as "available". Any other output should indicate a problem.
