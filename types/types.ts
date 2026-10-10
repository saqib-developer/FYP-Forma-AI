export type ProjectType = {
    id: number,
    projectId: string,
    device: string,
    userId: string,
    userInput: string,
    createdAt: string,
    projectName?: string,
    theme?: string,
    projectVisualDescription?: string,
    logo?: string
}

export type ScreenConfigType = {
    id: number,
    screenId: string,
    screenName: string,
    purpose: string,
    screenDescription: string,
    code: string,
    aiReview?: any
}
