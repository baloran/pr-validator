import * as core from '@actions/core'
import * as github from '@actions/github'

const ALLOWED_EXTENSIONS = [
  'js',
  'ts',
  'jsx',
  'tsx',
  'json',
  'yml',
  'yaml',
  'md',
  'markdown',
]

async function run(): Promise<void> {
  let messages: string = `
  ## PR Validator

  `
  try {
    const token = core.getInput('github-token', { required: true })
    const octokit = github.getOctokit(token)
    const mandatoryAssigneeInput = core.getInput('mandatory-assignee')
    const mandatoryAssignee = mandatoryAssigneeInput.toLowerCase() === 'true'

    const context = github.context

    if (context.payload.pull_request == null) {
      messages += `This action can only be run on pull_request events.`

      return
    }

    const pr = context.payload.pull_request

    let isValid = true

    if (mandatoryAssignee) {
      if (pr.assignees == null || pr.assignees.length === 0) {
        isValid = false
        messages += `Pull request must have an assignee.`
      }
    }

    if (isValid) {
      core.info('Pull request is valid.')
    } else {
      messages += `Pull request is invalid.`
    }

    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
      per_page: 100,
    })

    const totalChangedLines = countChangedLinesByExtension(
      files,
      ALLOWED_EXTENSIONS,
    )

    if (totalChangedLines > 500) {
      messages += `Pull request has too many changed lines.`
    }
  } catch (error: any) {
    messages += `Error: ${error.message}`
  }

  core.setOutput('messages', messages)
}

type PullRequestFile = {
  filename: string
  patch?: string
}

export function countChangedLinesByExtension(
  files: PullRequestFile[],
  allowedExtensions: string[],
): number {
  let total = 0

  for (const file of files) {
    const extension = file.filename.substring(file.filename.lastIndexOf('.'))

    if (!allowedExtensions.includes(extension)) {
      continue
    }

    if (!file.patch) {
      continue
    }

    const changedLines = file.patch
      .split('\n')
      .filter(
        (line) =>
          (line.startsWith('+') && !line.startsWith('+++')) ||
          (line.startsWith('-') && !line.startsWith('---')),
      ).length

    total += changedLines
  }

  return total
}

run()
