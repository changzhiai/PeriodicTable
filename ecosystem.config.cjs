module.exports = {
    apps: [
        {
            name: "periodic-table",
            script: "npm",
            args: "run preview",
            env: {
                PORT: 3004,
                NODE_ENV: "production",
            },
        },
    ],
};
