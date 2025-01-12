/**
 * PM2 Lib Module
 *
 * This module provides utility functions to interact with PM2 process manager.
 * It allows listing processes, starting new processes, stopping existing ones,
 * deleting processes, and checking if a specific process exists.
 * 
 * Functions:
 * - pm2List: Retrieves and parses the list of running processes managed by PM2.
 * - pm2Start: Starts a new process with the specified file path, name, and arguments.
 * - pm2Stop: Stops a process by name if it exists.
 * - pm2Delete: Deletes a process by name if it exists.
 * - doesProcessExist: Checks if a process with the given name exists.
 *
 * Dependencies:
 * - `node-cmd`: Used to execute shell commands.
 * 
 */
const cmd = require("node-cmd")

function runCommand(command) {
    const data = cmd.runSync(command, { shell: true })
    return data
}

async function doesProcessExist(name) {
    try {
        const pm2TaskList = await pm2List()
        const process = pm2TaskList.find((process) => process.name === name)
        return process !== undefined
    } catch (error) {
        throw error
    }
}

async function pm2List() {
    try {
        const result = runCommand("pm2 jlist")
        if (result === null || result.data === null) {
            return []
        }
        return JSON.parse(result.data).map((process) => ({
            id: process.pm_id,
            name: process.name,
            moduleVersion: process.pm2_env.axm_options["module_version"]
                ? process.pm2_env.axm_options["module_version"]
                : "N/A",
            status: process.pm2_env.status,
            restarts: process.pm2_env.restart_time,
            heapUsage: `${process.pm2_env.axm_monitor["Heap Usage"]
                ? process.pm2_env.axm_monitor["Heap Usage"].value
                : 0
                }%`,
            heapSize: `${process.pm2_env.axm_monitor["Heap Size"]
                ? process.pm2_env.axm_monitor["Heap Size"].value
                : 0
                }MiB`,
            eventLoopListening: `${process.pm2_env.axm_monitor["Event Loop Latency"]
                ? process.pm2_env.axm_monitor["Event Loop Latency"].value
                : 0
                }ms`,
            monitCpu: process.monit.cpu,
            maxMemory: process.pm2_env.max_memory_restart
                ? parseInt(process.pm2_env.max_memory_restart / 10 ** 6)
                : 0,
        }))
    } catch (error) {
        throw error
    }
}

async function pm2Start(filePath, name = null, args = null) {
    try {
        runCommand(
            `pm2 start ${filePath} --no-autorestart --name "${name}" -- ${args}`,
        )
        const processes = await pm2List()
        return processes
    } catch (error) {
        throw error
    }
}

async function pm2Delete(name) {
    try {
        const pm2TaskList = await pm2List()
        const process = pm2TaskList.find((process) => process.name === name)
        if (process) {
            const deleteCommand = `pm2 delete ${name}`
            runCommand(deleteCommand)
        } else {
            throw new Error("process not found on pm2")
        }
        const processes = await pm2List()
        return processes
    } catch (error) {
        throw error
    }
}

async function pm2Stop(name) {
    try {
        const pm2TaskList = await pm2List()
        const process = pm2TaskList.find((process) => process.name === name)
        if (process) {
            const stopCommand = `pm2 stop ${name}`
            runCommand(stopCommand)
        } else {
            throw new Error("process not found on pm2")
        }
        const processes = await pm2List()
        return processes
    } catch (error) {
        throw error
    }
}

module.exports = {
    pm2List: pm2List,
    pm2Start: pm2Start,
    pm2Stop: pm2Stop,
    pm2Delete: pm2Delete,
    doesProcessExist: doesProcessExist,
}
