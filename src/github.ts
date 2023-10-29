import { Octokit } from "octokit";
import { HttpsProxyAgent } from "https-proxy-agent";

export class Github {
  private readonly _octokit: Octokit;

  constructor(token: string, proxy: string) {
    this._octokit = new Octokit({
      auth: token,
      request: {
        agent: new HttpsProxyAgent(proxy),
      },
    });
  }

  async getUser() {
    const { data } = await this._octokit.rest.users.getAuthenticated();

    return data;
  }

  async createRepository(name: string) {
    console.log(`Creating repo with name ${name} ...`);
    await this._octokit.rest.repos.createForAuthenticatedUser({ name: name });

    const repos = await this.getRepos();
    const createdRepo = repos.find((r: any) => r.name === name);
    if (!createdRepo) throw new Error(`Couldnt create repo with name ${name}`);

    console.log(`Repo with name ${name} created.`);

    return createdRepo;
  }

  async getRepos() {
    const repos = (
      await this._octokit.rest.repos.listForUser({
        username: (await this.getUser()).login,
      })
    ).data;

    return repos;
  }

  async getLatestCommit(repoName: string, branch: string) {
    const username = (await this.getUser()).login;
    let commit;
    try {
      const { data: refData } = await this._octokit.rest.git.getRef({
        owner: username,
        repo: repoName,
        ref: `heads/${branch}`,
      });
      const commitSha = refData.object.sha;
      const { data: commitData } = await this._octokit.rest.git.getCommit({
        owner: username,
        repo: repoName,
        commit_sha: commitSha,
      });
      commit = {
        commitSha,
        treeSha: commitData.tree.sha,
      };
      console.log(`Latest commit SHA: ${commit.commitSha}`);
    } catch (e) {
      console.log(`There are no commits yet!`);
    }

    return commit;
  }

  async createCommit(
    repoName: string,
    branch: string,
    filePath: string,
    fileContent: string,
    message: string
  ) {
    console.log(
      `Starting creating commit ...\nrepo: ${repoName}\nbranch: ${branch}\nfilepath: ${filePath}\ncommit message: ${message}\nfile content: ${fileContent}`
    );
    const user = await this.getUser();

    const latestCommit = await this.getLatestCommit(repoName, "main");

    let newCommitSha;
    if (latestCommit) {
      const newTree = await this.createNewTree(
        user.login,
        repoName,
        fileContent,
        filePath,
        latestCommit.treeSha
      );

      const commit: any = {
        owner: user.login,
        repo: repoName,
        message,
        tree: newTree.sha,
        parents: [latestCommit.commitSha],
      };

      newCommitSha = (await this._octokit.rest.git.createCommit(commit)).data
        .sha;

      await this._octokit.rest.git.updateRef({
        owner: user.login,
        repo: repoName,
        ref: `heads/${branch}`,
        sha: newCommitSha,
      });
    } else {
      const { data } =
        await this._octokit.rest.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: filePath,
          message,
          content: btoa(fileContent),
          branch,
        });
      newCommitSha = data.commit.sha;
    }

    console.log(
      `Commit created. URL: https://github.com/${user.login}/${repoName}/commit/${newCommitSha}`
    );

    return newCommitSha;
  }

  async createNewTree(
    username: string,
    repoName: string,
    fileContent: string,
    path: string,
    latestCommitSha: string
  ) {
    const requestData: any = {
      owner: username,
      repo: repoName,
      base_tree: latestCommitSha,
      tree: [
        {
          path,
          mode: `100644`,
          type: `blob`,
          content: fileContent,
        },
      ],
    };

    const { data } = await this._octokit.rest.git.createTree(requestData);
    return data;
  }

  async createBlobForFile(
    username: string,
    repoName: string,
    fileContent: string
  ) {
    const blobData = await this._octokit.rest.git.createBlob({
      owner: username,
      repo: repoName,
      content: fileContent,
      encoding: "utf-8",
    });

    return blobData;
  }
}
