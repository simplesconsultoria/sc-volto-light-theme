# syntax=docker/dockerfile:1
ARG SEED=1000
ARG PLONE_VERSION=6.2.1
FROM plone/server-builder:${PLONE_VERSION} AS builder

WORKDIR /app


# Add local code
COPY scripts/ scripts/
COPY . src

# Install local requirements and pre-compile mo files
RUN <<EOT
    set -e
    bin/pip install mxdev uv
    sed -i 's/-e .\[test\]/./g' src/mx.ini
    cd /app/src
    # remove potentially existing virtualenv from local build
    rm -rf .venv
    ../bin/mxdev -c mx.ini
    ../bin/uv pip install -r requirements-mxdev.txt
    ../bin/python /compile_mo.py
EOT

FROM plone/server-prod-config:${PLONE_VERSION}

LABEL maintainer="Simples Consultoria <contato@simplesconsultoria.com.br>" \
      org.label-schema.name="sc-volto-light-theme-backend" \
      org.label-schema.description="Simples Consultoria VLT demo content image." \
      org.label-schema.vendor="Simples Consultoria"

# Copy /app from builder
COPY --from=builder /app /app

# Re-declared here so the build arg is in scope for this stage: a global ARG
# only provides the default. Kept after COPY so a new seed rebuilds the site
# without invalidating the layers above it.
ARG SEED

RUN <<EOT
    set -e
    ln -s /data /app/var
    # Create a new site with content
    echo ${SEED} > /app/__created__.txt
    SEED=${SEED} ./docker-entrypoint.sh create-site
EOT
