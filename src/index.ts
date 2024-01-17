import { LoremIpsum } from "lorem-ipsum";
import { Github } from "./github";
import Random from "./random";
import StateStorage from "./stateStorage";
import * as fs from "fs";

const DAYS_FOR_PUSH = 30; // how many days pushing in repo
const DELAY_BETWEEN_DAYS_IN_S = 60 * 60 * 24; // 1 day
const DELAY_BETWEEN_ACCS_IN_S = 60; // 1 min

const TOKENS = fs.readFileSync("tokens.txt", "utf-8").split(/\r?\n/);
const PROXIES = fs.readFileSync("proxies.txt", "utf-8").split(/\r?\n/);

async function main() {
  if (TOKENS.length !== PROXIES.length)
    throw new Error(`Number of tokens is not equal with number of proxies!`);

  for (let i = 0; i < DAYS_FOR_PUSH; i++) {
    console.log(`Github Day ${i + 1} started.`);

    let user: any = {};
    for (let j = 0; j < TOKENS.length; j++) {
      try {
        const token = TOKENS[j];
        const proxyArr = PROXIES[j].split(":");
        const proxy = `http://${proxyArr[2]}:${proxyArr[3]}@${proxyArr[0]}:${proxyArr[1]}/`;
        const github = new Github(token, proxy);
        user = await github.getUser();
        const state = StateStorage.load(`github/${j + 1}_${user.login}`, {
          defaultState: { days: 0 },
          readable: true,
          fileExt: ".json",
        });
        console.log(`Account ${j + 1} (${user.login}) started.`);

        const lorem = new LoremIpsum();

        const repos = await github.getRepos();
        let repo = repos[0];
        if (!repo || repos.length < 5) {
          repo = await github.createRepository(
            lorem.generateWords(2).replace(" ", "")
          );
          await delay(Random.intFromInterval(60, 180));
        } else {
          repo = Random.from(repos);
        }

        const extensions = ["json", "js", "ts", "py", "cairo"];
        let name = "";
        const depth = Random.intFromInterval(1, 3);
        for (let i = 0; i < depth; i++) {
          name += lorem.generateWords(1);
          if (i != depth - 1) name += "/";
        }
        await github.createCommit(
          repo.name,
          "main",
          `${name}.${Random.from(extensions)}`,
          lorem.generateParagraphs(Random.intFromInterval(1, 10)),
          lorem.generateWords(Random.intFromInterval(1, 5))
        );
        state.days = state.days + 1;
        state.save();
        console.log(`Account ${j + 1} (${user.login}) finished.`);

        if (j !== TOKENS.length - 1) {
          console.log(`Waiting ${DELAY_BETWEEN_ACCS_IN_S} s. ...`);
          await delay(DELAY_BETWEEN_ACCS_IN_S);
        }
      } catch (e) {
        console.log(
          `Error during Github commit. Account ${j + 1} (${
            user.login
          })\nError: ${e}`
        );
      }
    }
    console.log(`Github Day ${i + 1} finished.`);
    if (i !== DAYS_FOR_PUSH - 1) {
      console.log(`Waiting ${DELAY_BETWEEN_DAYS_IN_S} s. ...`);
      await delay(DELAY_BETWEEN_DAYS_IN_S);
    }
  }
}

async function delay(seconds: number): Promise<void> {
  return new Promise((r) => setTimeout(r, seconds * 1000));
}

main();
