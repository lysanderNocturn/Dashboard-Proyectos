import * as React from "react"
import { Upload, X, File, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const FileUpload = React.forwardRef(({
  className,
  accept,
  multiple = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesChange,
  value = [],
  disabled = false,
  ...props
}, ref) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [error, setError] = React.useState("")
  const fileInputRef = React.useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `El archivo ${file.name} es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB.`
    }
    return null
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    const validFiles = []
    const errors = []

    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        })
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'))
      return
    }

    setError("")

    const newFiles = multiple ? [...value, ...validFiles] : validFiles
    const limitedFiles = newFiles.slice(0, maxFiles)

    onFilesChange?.(limitedFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const removeFile = (fileId) => {
    const newFiles = value.filter(f => f.id !== fileId)
    // Revoke object URL to prevent memory leaks
    const removedFile = value.find(f => f.id === fileId)
    if (removedFile?.preview) {
      URL.revokeObjectURL(removedFile.preview)
    }
    onFilesChange?.(newFiles)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Upload Area */}
      <div
        ref={ref}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50",
          "hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {multiple ? "Arrastra archivos aquí o haz clic para seleccionar" : "Arrastra un archivo aquí o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept ? `Tipos permitidos: ${accept}` : "Todos los tipos de archivo"}
              {maxSize && ` • Máximo ${formatFileSize(maxSize)} por archivo`}
              {multiple && maxFiles > 1 && ` • Hasta ${maxFiles} archivos`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Archivos seleccionados ({value.length})</p>
          <div className="grid gap-2">
            {value.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <File className="h-5 w-5" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

FileUpload.displayName = "FileUpload"

export { FileUpload }