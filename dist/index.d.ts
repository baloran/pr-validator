type PullRequestFile = {
    filename: string;
    patch?: string;
};
export declare function countChangedLinesByExtension(files: PullRequestFile[], allowedExtensions: string[]): number;
export {};
