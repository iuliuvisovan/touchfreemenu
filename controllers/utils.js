const { Translate } = require('@google-cloud/translate').v2;

exports.translate = async (input, from = 'ro', to = 'en') => {
  let translation = '';
  if (!input) {
    return translation;
  }
  const gcpClient = new Translate({
    key: process.env.GCP_TRANSLATION_API_KEY,
    projectId: process.env.GCP_TRANSLATION_PROJECT_ID,
  });
  try {
    [translation] = await gcpClient.translate(input, { from, to });
  } catch (err) {}

  return translation?.[0]?.toUpperCase() + translation?.slice(1);
};

exports.toImageUrl = (imageKey) => (imageKey ? `https://${process.env.AWS_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${imageKey}` : '');
