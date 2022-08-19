#!/bin/bash

function createServiceAccount {

  gcloud services enable iamcredentials.googleapis.com --project "$PROJECT_ID" || exit 1;

  echo
  echo "Creating service account for Github action runner"
  if gcloud iam service-accounts describe "github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" > /dev/null ; then
    echo "Github Action Runner service account already exists. Skipping..."
  else
    gcloud iam service-accounts create "github-action-runner" \
      --project "$PROJECT_ID" \
      --display-name="Github Action Runner" > /dev/null || exit 1;
    echo "Service account created."
  fi

  echo
  echo "Adding roles to Github action runner"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/firebasehosting.admin" > /dev/null || exit 1;

  echo "github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" > 'GITHUB_SECRET__SERVICE_ACCOUNT'
  echo "Service account name exported to $(pwd)/GITHUB_SECRET__SERVICE_ACCOUNT"
}


if [ -z "$REGION" ]; then
  REGION="europe-west4"
fi

echo "This script will setup Google Cloud Firebase hosting (for Frontend) and/or Cloud Run (for Backend)"
echo
echo "It also sets up Google Cloud for these to be deploted using the Github actions"
echo "defined in the JW Player OTT Web App Repo (https://github.com/jwplayer/ott-web-app)"
echo
echo "Please make sure you have both the gcloud and firebase cli clients installed."
echo
read -r -p "Enter a project ID ($PROJECT_ID): " projectId
read -r -p "Enter the Github repo to connect to ($REPO): " githubRepo
read -r -p "Enter a gcloud region ($REGION): " gcloudRegion

if [ -z "$projectId" ]; then
  projectId=$PROJECT_ID

  if [ -z "$projectId" ]; then
    echo "Please enter a valid Project ID"
    exit 1
  fi
fi

if [ -z "$githubRepo" ]; then
  githubRepo=$REPO
  if [ -z "$githubRepo" ]; then
    echo "Please set the REPO environment variable equal to the <owner>/<repository> that you want to run this script for"
    exit 1
  fi
fi

if [ -z "$gcloudRegion" ]; then
  gcloudRegion=$REGION
fi

echo
echo "We are about to setup the Google Cloud environment with the settings below."
echo "Project: $projectId"
echo "Repo: $githubRepo"
echo "Region: $gcloudRegion"
echo
read -r -p "Do you want to proceed? (y/N) " confirm

if [ "$confirm" != "Y" ] && [ "$confirm" != "y" ]; then
  echo "Aborting..."
  exit 1;
fi

echo "$gcloudRegion" > 'GITHUB_SECRET__GCLOUD_REGION'
echo "Gcloud Region exported to $(pwd)/GITHUB_SECRET__GCLOUD_REGION"
echo "$projectId" > 'GITHUB_SECRET__GCLOUD_PROJECT'
echo "Project ID exported to $(pwd)/GITHUB_SECRET__GCLOUD_PROJECT"

echo
read -r -p "Do you want to setup the Firebase project? (y/N) " confirm

if [ "$confirm" = "Y" ] || [ "$confirm" = "y" ]; then

  firebase login || exit 1;

  echo
  echo "Enabling and selecting Firebase project"
  if ! firebase use "$PROJECT_ID" ; then
    echo
    echo "Project with Project ID='$PROJECT_ID' was not found."
    read -r -p "Do you want to create it? (y/N) " confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
      read -r -p "Please enter a Display Name ($PROJECT_ID) " displayName
      if [ -z "$displayName" ]; then
        displayName="$PROJECT_ID"
      fi

      firebase projects:create --display-name "$displayName" "$PROJECT_ID"
      firebase use "$PROJECT_ID" || exit 1;
    else
      echo "Can't proceed without project. Exiting..."
      exit 1;
    fi
  else
    echo "Firebase project already exists and is selected."
  fi

  if [ -z "$(gcloud auth print-identity-token)" ]; then
    echo
    echo "Logging in to gcloud cli"
    gcloud auth login || exit 1;
  fi

  gcloud config set project "$PROJECT_ID" || exit 1;

  echo
  echo "Enabling Firebase API"
  gcloud services enable firebase.googleapis.com --project "$PROJECT_ID" || exit 1;
  gcloud services enable firebasehosting.googleapis.com --project "$PROJECT_ID" || exit 1;

  createServiceAccount

  echo
  echo "Firebase setup complete."
  echo
  read -r -p "Do you want to generate a new key for the FIREBASE_SERVICE_ACCOUNT_KEY secret? (y/N) " confirm

  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    gcloud iam service-accounts keys create GITHUB_SECRET__FIREBASE_SERVICE_ACCOUNT_KEY --iam-account="github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com"
    echo
    echo "The key was exported to $(pwd)/GITHUB_SECRET__FIREBASE_SERVICE_ACCOUNT_KEY."
    echo "Copy the contents of this file to the secret FIREBASE_SERVICE_ACCOUNT_KEY on the ${REPO} repo."
    echo
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "! Keep the contents of this file safe. DO NOT COMMIT IT TO GIT!        !"
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  fi
else
  echo "Skipping Firebase setup..."
fi

echo
read -r -p "Do you want to setup backend hosting with Cloud Run? (y/N) " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then

  echo
  echo "Installing the beta component for access to the Project Billing information"
  gcloud components install beta || exit 1;

  echo
  echo "Verifying that billing is enabled for this project"
  if ! gcloud beta billing projects describe "$PROJECT_ID" | grep -q 'billingEnabled: true'; then
    echo "Billing is NOT enabled."
    echo

    billingAccounts=()
    index=1
    while read -r line; do
      if [[ ! ${line} =~ ^ACCOUNT_ID ]]; then
        # shellcheck disable=SC2206
        arr=($line);
        billingAccounts+=("${arr[0]}")
        echo "$index) $line"
        index+=1
      else
        echo "   $line"
      fi
    done < <(gcloud beta billing accounts list || exit 1;)

    if [ ${#billingAccounts[@]} -eq 0 ]; then
      echo "No billing accounts found. Exiting..."
      exit 1;
    fi

    read -r -p "Please enter the number of the billing account you want to use (1 - ${billingAccounts[0]}): " billingAccountIndex

    if [ -z "$billingAccountIndex" ]; then
      billingAccountIndex=1
    fi

    billingAccount="${billingAccounts[$billingAccountIndex-1]}"

    echo
    echo "Linking billing account '$billingAccount' to project"

    gcloud beta billing projects link "$PROJECT_ID" --billing-account="$billingAccount" || exit 1;

  else
    echo "Billing is enabled."
  fi

  echo
  echo "Enabling Backend APIs"
  gcloud services enable run.googleapis.com --project "$PROJECT_ID" || exit 1;
  gcloud services enable cloudbuild.googleapis.com --project "$PROJECT_ID" || exit 1;
  gcloud services enable artifactregistry.googleapis.com --project "$PROJECT_ID" || exit 1;

  createServiceAccount

  echo
  echo "Creating Identity pool for Github action runner"
  if gcloud iam workload-identity-pools describe github-action-pool --location=global > /dev/null ; then
    echo "Identity Pool already exists. Skipping..."
  else
    gcloud iam workload-identity-pools create "github-action-pool" \
      --project="$PROJECT_ID" \
      --location=global \
      --display-name="Github Action Pool" > /dev/null || exit 1;
    echo "Pool created."
  fi

  echo
  echo "Getting identity pool ID"
  WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe github-action-pool \
    --project="$PROJECT_ID" \
    --location=global \
    --format="value(name)") > /dev/null || exit 1;
  echo "Pool ID: $WORKLOAD_IDENTITY_POOL_ID"

  echo
  echo "Creating Github token provider"
  if gcloud iam workload-identity-pools providers describe github-token-provider \
    --location=global \
    --workload-identity-pool=github-action-pool > /dev/null \
  ; then
    echo "Provider already exists. Skipping..."
  else
    gcloud iam workload-identity-pools providers create-oidc github-token-provider \
      --project="$PROJECT_ID" \
      --location="global" \
      --workload-identity-pool="github-action-pool" \
      --display-name="Github Token Provider" \
      --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
      --issuer-uri="https://token.actions.githubusercontent.com" > /dev/null || exit 1;
    echo "Provider created."
  fi

  gcloud iam workload-identity-pools providers describe github-token-provider \
    --location=global \
    --workload-identity-pool=github-action-pool \
    --format="value(name)" \
    > 'GITHUB_SECRET__GCLOUD_IDENTITY_PROVIDER'
  echo "Identity Provider name exported to $(pwd)/GITHUB_SECRET__GCLOUD_IDENTITY_PROVIDER"


  echo
  echo "Adding roles to Github action runner"
  gcloud iam service-accounts add-iam-policy-binding "github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project="${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}" > /dev/null || exit 1;
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin" > /dev/null || exit 1;
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder" > /dev/null || exit 1;
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" > /dev/null || exit 1;
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin" > /dev/null || exit 1;
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin" > /dev/null || exit 1;

# TODO: Create and setup JW_API_SECRET

else
  echo "Skipping Backend setup..."
fi

echo
echo "Script complete. Ka-chow!!"
echo
echo "!! Remember to copy the values from the GITHUB_SECRET__ files into Github repo secrets for the Github actions to use!!"
echo
exit 0;

# TODO: Make the service public by default
