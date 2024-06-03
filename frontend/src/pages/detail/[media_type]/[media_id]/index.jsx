import AppLayout from '@/components/Layouts/AppLayout'
import { useAuth } from '@/hooks/auth'
import laravelAxios from '@/lib/laravelAxios'
import AddIcon from '@mui/icons-material/Add'
import StarIcon from '@mui/icons-material/Star'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Button, ButtonGroup, Card, CardContent, Container, Fab, Grid, IconButton, Modal, Rating, TextareaAutosize, Tooltip, Typography } from '@mui/material'
import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Detail = ({detail, media_type, media_id}) => {
  const[open, setOPen] = useState(false)
  const[rating, setRating] = useState(0)
  const[review, setReview] = useState('')
  const[reviews, setReviews] = useState([])
  const[averageRating, setAverageRating] = useState(null)
  const[editMode, setEditMode] = useState(null)
  const[editedRating, setEditedRating] = useState(null)
  const[editedContent, setEditedContent] = useState('')
  const[isFavorited, setIsFavorited] = useState(false)

  const { user } = useAuth({middleware: 'auth'})

  const handleOpen = () => {
    setOPen(true)
  }

  const handleClose = () => {
    setOPen(false)
  }

  const handleRatingChange = (e, newValue) => {
    setRating(newValue)
  }

  const handleReviewChange = (e) => {
    setReview(e.target.value)
  }

  const isButtonDisabled = (rating, content) => {
    return !rating || !content.trim()
  }

  const isReviewButtonDisabled = isButtonDisabled(rating, review)
  const isEditButtonDisabled = isButtonDisabled(editedRating, editedContent)

  const handleReviewAdd = async() => {
    handleClose()

    try {
        const response = await laravelAxios.post('api/reviews', {
            content: review,
            rating: rating,
            media_type: media_type,
            media_id: media_id,
        })
        
        const newReview = response.data

        setReviews([...reviews, newReview]);

        setRating(0)
        setReview('')

        const updatedReviews = [...reviews, newReview]

        updateAverageRating(updatedReviews)

    } catch (error) {
        console.log(error)
    }
  }

  const updateAverageRating = (updatedReviews) => {
    if (updatedReviews.length > 0) {
        const totalRating = updatedReviews.reduce((acc, review) => acc + review.rating, 0)

        const average = (totalRating / updatedReviews.length).toFixed(1)

        setAverageRating(average)
    } else {
        setAverageRating(null)
    }

  }

  const handleDelete = async(id) => {
    if (confirm('レビューを削除してよろしいですか？')) {
        try {
            const response = await laravelAxios.delete(`api/review/${id}`)

            const filteredReviews = reviews.filter((review) => review.id !== id)

            setReviews(filteredReviews)

            updateAverageRating(filteredReviews)
        } catch (error) {
            console.log(error)
        }
    }
  }

  const handleEdit = (review) => {
    setEditMode(review.id)
    setEditedRating(review.rating)
    setEditedContent(review.content)
  }

  const handleConfirmEdit = async(reviewId) => {
    try {
        const response = await laravelAxios.put(`api/review/${reviewId}`, {
            content: editedContent,
            rating: editedRating,
        })

        const updatedReview = response.data

        const updatedReviews = reviews.map((review) => {
            if (review.id === reviewId) {
                return {
                    ...review,
                    content: updatedReview.content,
                    rating: updatedReview.rating,
                }
            }
            return review
        })

        setReviews(updatedReviews)

        setEditMode(null)
    } catch (error) {
        console.log(error)
    }
  }

  const handleToggleFavorite = async() => {
    try {
        const response = await laravelAxios.post('api/favorites', {
            media_type: media_type,
            media_id: media_id,
        })
        
        setIsFavorited(response.data.status === 'added')
    } catch(error) {
        console.log(error)
    }
  }

  useEffect(() => {
    const fetchReviews = async() => {
        try {
            const [reviewResponse, favoriteResponse] = await Promise.all([
                laravelAxios.get(`api/reviews/${media_type}/${media_id}`),
                laravelAxios.get('api/favorites/status', {
                    params: {
                        media_type: media_type,
                        media_id: media_id,
                    }
                }),
            ])
            const fetchReviews = reviewResponse.data

            setReviews(fetchReviews)
            updateAverageRating(fetchReviews)

            setIsFavorited(favoriteResponse.data)
        } catch (error) {
            console.log(error)
        }
    }

    fetchReviews()

  }, [media_type, media_id])

  return (
    <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Detail
                </h2>
            }>
            <Head>
                <title>Cinema Treasure - Detail</title>
            </Head>
            {/* 映画情報部分 */}
            <Box
                sx={{ 
                    height: { xs: "auto", md: "70vh"}, bgcolor: "red", position: "relative", display: "flex", alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original/${detail.backdrop_path})`,
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",

                        '&::before': {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(10px)',
                        }
                    }}
                />
                <Container
                    sx={{ 
                        zIndex: 1,
                    }}
                >
                    <Grid sx={{ color: "white" }} container alignItems={"center"}>
                        <Grid item md={4} sx={{ display: "flex", justifyContent: "center" }}>
                            <img width={"70%"} src={`https://image.tmdb.org/t/p/original${detail.poster_path}`} alt="" />
                        </Grid>
                        <Grid item md={8}>
                            <Typography variant="h4" paragraph>{detail.title || detail.name}</Typography>
                            <Typography paragraph>{detail.overview}</Typography>
                            <IconButton onClick={handleToggleFavorite} style={{ color: isFavorited ? "red" : "white", background: '#0d253f'}}>
                                <FavoriteIcon />
                            </IconButton>
                            <Box
                                gap={2}
                                sx={{ 
                                    display: "flex",
                                    alignItem: "center",
                                    mb: 2,
                                 }}
                            >
                                <Rating
                                    readOnly
                                    precision={0.5}
                                    value={parseFloat(averageRating)}
                                    emptyIcon={<StarIcon style={{ color: "white"}}/>}
                                />
                                <Typography
                                    sx={{ 
                                        ml: 1,
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                     }}
                                >
                                    {averageRating}
                                </Typography>

                            </Box>
                            <Typography variant="h6">
                                {media_type === "movie" ? `公開日:${detail.release_date}` : `初回放送日:${detail.first_air_date}`}
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            {/* 映画情報ここまで */}

            {/* レビュー内容部分 */}
            <Container sx={{py: 4}}>
                <Typography
                    component={'h1'}
                    variant='h4'
                    align='center'
                    gutterBottom
                >
                    レビュー一覧
                </Typography>
                <Grid container spacing={3}>
                    {reviews.map((review) => (
                        <Grid item xs={12} key={review.id}>
                            <Card>
                                <CardContent>
                                    {/* ユーザー名 */}
                                    <Typography
                                        variant='h6'
                                        component={'div'}
                                        gutterBottom
                                    >
                                        {review.user.name}
                                    </Typography>
                                    {editMode === review.id ? (
                                        <>
                                        {/* 編集ボタン押下時 */}
                                            <Rating value={editedRating} onChange={(e, newValue) => setEditedRating(newValue)} />
                                            <TextareaAutosize minRows={3} style={{ width: "100%" }} value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}/>
                                        </>
                                    ) : (
                                        <>
                                            {/* 星 */}
                                            <Rating
                                                value={review.rating}
                                                readOnly
                                            />

                                            {/* レビュー内容 */}
                                            <Link href={`/detail/${media_type}/${media_id}/review/${review.id}`}>
                                                <Typography
                                                    variant='body2'
                                                    color='textSecondary'
                                                    paragraph
                                                >
                                                    {review.content}
                                                </Typography>
                                            </Link>
                                        </>
                                    )}

                                    {user?.id === review.user.id && (
                                        <Grid sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            {editMode === review.id ? (
                                                <Button onClick={() => handleConfirmEdit(review.id)} disabled={isEditButtonDisabled}>編集確定</Button>
                                            ) : (
                                                <ButtonGroup>
                                                    <Button onClick={() => handleEdit(review)}>編集</Button>
                                                    <Button color="error" onClick={() => handleDelete(review.id)}>削除</Button>
                                                </ButtonGroup>

                                            )}
                                            
                                        </Grid>
                                    )}

                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            {/* レビュー内容ここまで */}

            {/* レビュー追加ボタン */}
            <Box
                sx={{ 
                    position: "fixed",
                    bottom: "16px",
                    right: "16px",
                    zIndex: 5,

                 }}
            >
                <Tooltip title="レビューを追加">
                    <Fab
                        style={{ background: "#1978d2", color: "white"}}
                        onClick={handleOpen}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>

            </Box>
            {/* レビュー追加ボタンここまで */}

            {/* モーダルウィンドウ */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{ 
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                     }}
                >
                    <Typography variant="h6" component="h2">
                        レビュを書く
                    </Typography>
                    <Rating
                        required
                        onChange={handleRatingChange}
                        value={rating}
                    />
                    <TextareaAutosize
                        required
                        minRows={5}
                        placeholder='レビュー内容'
                        style={{ width: "100%", marginTop: "10px" }}
                        onChange={handleReviewChange}
                        value={review}
                    />
                    <Button
                        variant="outlined"
                        disabled={isReviewButtonDisabled}
                        onClick={handleReviewAdd}
                    >
                        送信
                    </Button>
                </Box>
            </Modal>

    </AppLayout>
  )
}

//SSR
export async function getServerSideProps(context) {
    const { media_type, media_id } = context.params

    try {
        const jpResponse = await axios.get(`https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${process.env.TMDB_API_KEY}&language=ja-JP`)

        let combinedData = {...jpResponse.data}

        if (!jpResponse.data.overview) {
            const enResponse = await axios.get(`https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`)
            combinedData.overview = enResponse.data.overview
        }

        return {
            props: {
                detail: combinedData, media_type, media_id
            }
        }
    } catch {
        return { notFound: true }
    }
}


export default Detail