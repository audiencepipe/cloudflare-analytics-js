 1 | ### Publishing New Version
 2 | 
 3 | This package follows semantic versioning. To publish a new version:
 4 | 
 5 | 1. Create and push a new git tag matching the format `browser@x.x`
 6 |    - This will automatically trigger the [Browser Candidate](https://github.com/audiencepipe/cloudflare-analytics-js-browser/blob/master/.github/workflows/deploy-browser-cdn-candidate.yml) workflow which will publish a candidate build to the CDN that you can test locally in an example app.
 7 |    - eg.
 8 |       ```sh
 9 |        git tag browser@x.y.z
10 | 
11 |        git push origin browser@x.y.z
12 |       ```
13 | 2. Create a new GitHub Release for the tag created in step 1.
14 |    - A new package will be published to NPM automatically via GitHub Actions. No need to manually bump any versions in `package.json` since the GH Action will automatically set the version based on the git tag.
15 |    - We do recommend bumping the `package.json` version manually if publishing a new **major** version as a way of documenting which major version the code base currently represents, but the published NPM/CDN packages will always use the version parsed from the git tag `browser@x.x.x`
16 | 
17 | #### Candidate Testing
18 | 
19 | If you need to test something more speculative, you can create tags not intended for release, like `browser@x.x.x-rc` that will automatically publish a candidate build to the CDN.