import server from "./server"

const { PORT } = process.env;

const serverStart = async () => {
    try {
        server.listen(PORT, ()=> {
            console.log(`⚡️[server]: Server is running on port ${PORT}`);
        })

    } catch (error) {
        console.log(error);
    }
}

serverStart()