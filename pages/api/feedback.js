import CORS from 'cors'
import globalAPICall from '../../utils/api/globalAPICall'
import publishMessage from '../../utils/api/publishMessage'
import createAssessment from '../../utils/api/createAssessment'
import { runMiddleware } from '../../utils/api/share'
import {
  projectId,
  feedbackFormName,
  feedbackFieldName,
  recaptchaSiteKey,
  recaptchaScoreBoundary,
} from '../../utils/api/config'
import { getFeedback } from '../../utils/api/getFeedback'

const cors = CORS({
  methods: ['HEAD', 'GET', 'POST'],
})

// default handler
async function handler(req, res) {
  await runMiddleware(req, res, cors)

  async function POST() {
    // recaptcha assessment
    const score = await createAssessment({
      projectID: projectId,
      recaptchaSiteKey,
      token: req.body.token,
      recaptchaAction: req.body.recaptchaAction,
    })

    if (score === null || score < recaptchaScoreBoundary) {
      return res.status(401).json({ message: 'recaptach assessment failed' })
    }

    // publish message to PubSub
    const result = await publishMessage(req)

    if (result === true) {
      res.status(200).json({})
    } else {
      res.status(400).json({ message: result })
    }
  }

  async function GET() {
    // get feedback from keystone
    const result = await getFeedback(feedbackFormName, feedbackFieldName, req)

    if (typeof result === 'string') {
      res.status(400).json({ message: result })
    } else {
      res.status(200).json(result)
    }
  }

  await globalAPICall(req, res, { POST, GET })
}

export default handler