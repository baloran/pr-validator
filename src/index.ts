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
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    core.error('GITHUB_TOKEN is not set')
    core.setFailed('GITHUB_TOKEN is not set')
    return
  }

  const octokit = github.getOctokit(token)
  const context = github.context
  const pr = context.payload.pull_request
  let error = false

  try {
    const mandatoryAssigneeInput = core.getInput('mandatory-assignee')
    const mandatoryAssignee = mandatoryAssigneeInput.toLowerCase() === 'true'

    if (pr == null) {
      error = true
      core.error('This action can only be run on pull_request events.')

      return
    }

    if (mandatoryAssignee) {
      if (pr.assignees == null || pr.assignees.length === 0) {
        error = true
        core.error('Pull request must have an assignee.')
      }
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
      error = true
      core.error('Pull request has too many changed lines.')
    } else {
      core.info(`Pull request has ${totalChangedLines} changed lines.`)
    }
  } catch (error: any) {
    error = true
    core.error(`Error: ${error?.message}`)
  }

  if (error) {
    core.setFailed('Pull request is not valid.')
  }
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
