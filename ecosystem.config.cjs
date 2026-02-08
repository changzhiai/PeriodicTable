module.exports = {
    apps: [
        {
            name: "periodic-table",
            script: "npm",
            args: "run preview -- --port 3004 --host",
            env: {
                PORT: 3004,
                NODE_ENV: "production",
            },
        },
    ],
};
