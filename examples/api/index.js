const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const PORT = 6789;
const URL = "http://192.168.27.33";

app.use(bodyParser.json());

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Your API',
    version: '1.0.0',
    description: 'API to execute shell script with parameters',
  },
  servers: [
    {
      url: `${URL}:${PORT}`,
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['index.js'], // Your file with Swagger comments (.js)
};

// Initialize Swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger UI at /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /inst:
 *   post:
 *     summary: Execute shell script with parameters
 *     description: Calls a shell script with model and text parameters and returns the output.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: Model parameter
 *                 example: mistral7B
 *               text:
 *                 type: string
 *                 description: Text parameter
 *                 example: "create me 3 names of heroes for dongeon and dragon, that doesn't already exist, in JSON without actually including a code snippet, with : id, name, race, class, skills, description"
 *               temp:
 *                 type: number
 *                 format: float
 *                 description: Temporary parameter
 *                 default: 0.7
*     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   description: Output from the shell script
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for missing parameters
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message for script execution failure
 */
app.post('/inst', (req, res) => {
  const { model, text, temp } = req.body;
  //let temp = req.body.temp | 0.7

  if (!model || !text) {
    return res.status(400).json({ error: 'Missing model or text parameters' });
  }
  if (model != "mistral7B") {
    return res.status(400).json({ error: 'model not valid' });
  }

  // Execute shell script with parameters
  const execCmd = `./inst.sh 32 ${temp || 0.7} "${text}"`
  console.log(execCmd)
  exec(execCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
    // Send stdout as the response
    res.status(200).json({ output: stdout });
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
