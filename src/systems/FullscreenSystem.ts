export const toggleGameFullscreen = async (root: HTMLElement | null = document.getElementById('game-container')) => {
    if (document.fullscreenElement) {
        await document.exitFullscreen();
        return true;
    }

    if (!document.fullscreenEnabled || !root?.requestFullscreen) {
        return false;
    }

    await root.requestFullscreen();
    return true;
};
