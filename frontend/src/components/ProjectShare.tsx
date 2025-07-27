import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '../hooks/useToast'

export const ProjectShare = () => {
  const { id: projectId } = useParams<{ id: string }>()
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const projectUrl = `${window.location.origin}/project/${projectId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setCopied(true)
      showToast({ title: 'Success', message: 'Project URL copied to clipboard!', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      showToast({ title: 'Error', message: 'Failed to copy URL. Please copy manually.', type: 'error' })
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join my hackathon project')
    const body = encodeURIComponent(
      `Hi! I'd like to invite you to join my hackathon project.\n\nProject URL: ${projectUrl}\n\nClick the link to access our project hub, task board, and collaboration tools.`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Share Project</h3>
      
      <div className="space-y-3">
        {/* URL Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project URL
          </label>
          <div className="flex">
            <input
              type="text"
              value={projectUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div className="flex space-x-2">
          <button
            onClick={shareViaEmail}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            📧 Share via Email
          </button>
          
          {navigator.share && (
            <button
              onClick={() => {
                navigator.share({
                  title: 'Join my hackathon project',
                  text: 'Join my hackathon project on hackerDen',
                  url: projectUrl
                })
              }}
              className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              📱 Share
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
          <p className="font-medium mb-1">How to join:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Share this URL with your team members</li>
            <li>They can click the link or paste it in their browser</li>
            <li>They'll have immediate access to the project</li>
          </ol>
        </div>
      </div>
    </div>
  )
}