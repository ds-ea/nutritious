# Nutritious

## Deployment

something like this, with `gcloud`set up

1. build admin (via npm !)
2. build app (nx)
3. build server (nx)
4. make sure `dist/apps/server/admin` has been copied from `apps/admin/dist`, and admin's _index.js_ contains the correct API URL at the bottom (look for "API URL is missing" or something).

```shell
gcloud builds submit --config ./cloudbuild.yaml ./dist
```
