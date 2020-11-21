import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Common.module.css'

import AppNavbar from '../lib/AppNavbar'
import { obtainSession } from '../lib/thi-api-client'
import { thiApiRequest } from '../lib/thi-api-request'

import Container from 'react-bootstrap/Container'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function Debug () {
  const [parameters, setParameters] = useState([])
  const [result, setResult] = useState('')
  const router = useRouter()

  useEffect(async () => {
    const initialParams = [
      {
        name: 'service',
        value: 'thiapp'
      },
      {
        name: 'method',
        value: 'persdata'
      },
      {
        name: 'session',
        value: await obtainSession(router)
      },
      {
        name: 'format',
        value: 'json'
      }
    ]

    setParameters(initialParams)
  }, [])

  function changeParameterName (i, name) {
    parameters[i].name = name
    setParameters(parameters.slice(0))
  }
  function changeParameterValue (i, value) {
    parameters[i].value = value
    setParameters(parameters.slice(0))
  }
  function addParameter () {
    const newParams = parameters.concat([{
      name: '',
      value: ''
    }])
    setParameters(newParams)
  }
  function removeParameter (index) {
    const newParams = parameters.slice(0)
    newParams.splice(index, 1)
    setParameters(newParams)
  }

  async function submit () {
    const params = {}
    parameters.forEach(entry => params[entry.name] = entry.value)
    try {
      setResult('Loading...')
      const resp = await thiApiRequest(params)
      setResult(JSON.stringify(resp, null, 4))
    } catch (e) {
      console.error(e)
      setResult(e.toString())
    }
  }

  return (
    <Container>
      <AppNavbar title="Debug" />

      <h3>Fields</h3>
      <ListGroup>
        {parameters && parameters.map((param, idx) =>
          <ListGroup.Item key={idx} className={styles.item}>
            <Row>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="name"
                  value={param.name}
                  onChange={e => changeParameterName(idx, e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="value"
                  value={param.value}
                  onChange={e => changeParameterValue(idx, e.target.value)}
                />
              </Col>
              <Col>
                <Button variant="danger" onClick={() => removeParameter(idx)}>
                  Remove
                </Button>
              </Col>
            </Row>
          </ListGroup.Item>
        )}
      </ListGroup>
      <br />
      <Button variant="primary" onClick={submit}>Submit</Button>
      {' '}
      <Button variant="success" onClick={addParameter}>Add Field</Button>

      <br />
      <h3>Result</h3>
      <pre>
        {result}
      </pre>
    </Container>
  )
}
