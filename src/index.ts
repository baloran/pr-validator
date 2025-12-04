import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const mandatoryAssigneeInput = core.getInput('mandatory-assignee')
    const mandatoryAssignee = mandatoryAssigneeInput.toLowerCase() === 'true'

    const context = github.context

    if (context.payload.pull_request == null) {
      core.setFailed('This action can only be run on pull_request events.')
      return
    }

    const pr = context.payload.pull_request

    let isValid = true
    let validationMessages: string[] = []

    if (mandatoryAssignee) {
      if (pr.assignees == null || pr.assignees.length === 0) {
        isValid = false
        validationMessages.push('Pull request must have an assignee.')
      }
    }

    if (isValid) {
      core.info('Pull request is valid.')
    } else {
      core.setFailed(
        `Pull request is invalid:\n- ${validationMessages.join('\n- ')}`,
      )
    }

    core.setOutput('isvalid', isValid.toString())
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
