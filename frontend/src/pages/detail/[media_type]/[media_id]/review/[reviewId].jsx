import CommentList from '@/components/CommentList'
import AppLayout from '@/components/Layouts/AppLayout'
import laravelAxios from '@/lib/laravelAxios'
import { Box, Button, Card, CardContent, Container, Rating, TextField, Typography } from '@mui/material'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

const ReviewDetail = () => {
  const[review, setReview] = useState(null)
  const[comments, setComments] = useState([])
  const[content, setContent] = useState('')

  const router = useRouter()
  const { reviewId } = router.query

  useEffect(() => {
    if (!reviewId) return
    const fetchReviewDetail = async() => {
        try {
            const response = await laravelAxios.get(`api/review/${reviewId}`)

            setReview(response.data)
            setComments(response.data.comments)
        } catch (error) {
            console.log(error)
        }
    }

    fetchReviewDetail()

  }, [reviewId])

  const handleChange = (e) => {
    setContent(e.target.value)
  }

  const handleCommentAdd = async(e) => {
    e.preventDefault()
    const trimmedContent = content.trim()
    if(!trimmedContent) return

    try {
        const response = await laravelAxios.post(`api/comments`, {
            content: trimmedContent,
            review_id: reviewId,
        })

        const newComment = response.data
        setComments([...comments, newComment])
        setContent('')
    } catch (error) {
        console.log(error)
    }
  }

  return (
    <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Review Detail
                </h2>
            }>
            <Head>
                <title>Cinema Treasure - Review Detail</title>
            </Head>

            <Container sx={{ py: 2}}>
                {review ? (
                    <>
                        {/* レビュー内容 */}
                        <Card sx={{ minHeight: '200px' }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    gutterBottom>
                                    {review.user.name}
                                </Typography>

                                <Rating
                                    name="read-only"
                                    value={review.rating}
                                    readOnly
                                />

                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    component="p">
                                    {review.content}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* 返信用のフォーム */}
                        <Box
                            component="form"
                            onSubmit={handleCommentAdd}
                            noValidate
                            autoComplete="off"
                            p={2}
                            sx={{
                                mb: 2,
                                display: 'flex',
                                alignItems: 'flex-start',
                                bgcolor: 'background.paper',
                            }}
                        >
                            <TextField
                                inputProps={{ maxLength: 200 }}
                                error={content.length > 200}
                                helperText={content.length > 200 ? '200文字を超えています' : ''}
                                fullWidth
                                label="comment"
                                variant="outlined"
                                value={content}
                                onChange={handleChange}
                                sx={{ mr: 1, flexGrow: 1 }}
                                onChange={handleChange}
                            />
                            <Button
                                variant="contained"
                                type="submit"
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                }}
                            >
                                送信
                            </Button>
                        </Box>

                        {/* コメント */}
                        <CommentList comments={comments} setComments={setComments} />
                    </>
                ) : (
                    <div>Loading...</div>
                )}
                
            </Container>
    </AppLayout>
  )
}

export default ReviewDetail