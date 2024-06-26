import { tss } from "tss-react/mui"
import { useState, useCallback, BaseSyntheticEvent, ChangeEvent, forwardRef, ReactNode } from 'react'
import { ThemeProvider } from "@mui/material/styles"
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import type { DialogProps } from "@mui/material"
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import theme from "./theme"
import logo from './images/logo.png'
import dog from './images/dog_hold.png'
import linkedin from './images/linkedin.png'
import email from './images/email.png'
import Api, { METHODS } from "./Api"
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, URL_PATHS } from "../../shared/constants"
import { AnimalType, User } from '../../shared/types'

const basicEmailValidator = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const InnerModal = forwardRef<ReactNode, { isLoading: boolean, modalMessage: string, modalTitle: string }>(function (props, _ref) {
  const { isLoading, modalMessage, modalTitle } = props
  const { classes } = useStyles()
  if (isLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={100} />
      </Box>
    )
  }
  return (
    <Box className={classes.modalMessageContainer}>
      <Typography className={`${classes.modalTitle} ${classes.textFont}`} variant="h6" component="h2">
        {modalTitle}
      </Typography>
      <Typography className={`${classes.modalMessage} ${classes.textFont}`}>
        {modalMessage}
      </Typography>
    </Box>
  )
})

function App() {
  const { classes } = useStyles()
  const [modalOpen, setModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [dogChecked, setDogChecked] = useState(false)
  const [catChecked, setCatChecked] = useState(false)
  const [nameFieldHelper, setNameFieldHelper] = useState('')
  const [emailFieldHelper, setEmailFieldHelper] = useState('')
  const [nameValue, setNameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const handleCloseModal: DialogProps["onClose"] = useCallback((_event: string, reason: string) => {
    if (isLoading && reason && reason === "backdropClick") {
      return
    }
    setModalOpen(false)
  }, [isLoading])
  const handleDogChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDogChecked(event.target.checked)
  }, [])
  const handleCatChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setCatChecked(event.target.checked)
  }, [])
  const handleNameFieldInput = useCallback((event: BaseSyntheticEvent) => {
    const { target: { value } } = event
    if (value.length <= NAME_MIN_LENGTH || value.length >= NAME_MAX_LENGTH) {
      setNameFieldHelper(`Please enter a name between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH}`)
    } else {
      setNameFieldHelper('')
    }
    setNameValue(value)
  }, [])
  const handleEmailFieldInput = useCallback((event: BaseSyntheticEvent) => {
    const { target: { value } } = event
    if (!basicEmailValidator(value)) {
      setEmailFieldHelper(`Please a valid email`)
    } else {
      setEmailFieldHelper('')
    }
    setEmailValue(value)
  }, [])
  const showLoading = useCallback(() => {
    setIsLoading(true)
    setModalOpen(true)
  }, [])
  const clearUserSelection = useCallback(() => {
    setNameValue('')
    setEmailValue('')
    setDogChecked(false)
    setCatChecked(false)
  }, [])
  const handleSubmit = useCallback(async () => {
    showLoading()
    const animalTypeSubscriptions = [dogChecked, catChecked].reduce((acc, curr, i) => {
      if (!curr) return acc
      if (i === 0) acc.push(AnimalType.Dog)
      if (i === 1) acc.push(AnimalType.Cat)
      return acc
    }, [] as AnimalType[])
    Api.makeRequest<User>(METHODS.Post, URL_PATHS.Subscribe, {
      body: {
        name: nameValue,
        email: emailValue,
        animalTypeSubscriptions
      }
    }).then(() => {
      setIsLoading(false)
      setModalTitle('Success!')
      setModalMessage('You have successfully subscribed! Check your mail box for confirmation.')
      setModalOpen(true)
      clearUserSelection()
    }).catch((error: Error) => {
      setIsLoading(false)
      setModalTitle('Error!')
      setModalMessage('There was a problem. Check back later or try again.')
      setModalOpen(true)
      console.error(error)
    })
  }, [nameValue, emailValue, dogChecked, catChecked])
  const isInvalidInput = nameFieldHelper !== '' || emailFieldHelper !== '' || nameValue.length < 1 || emailValue.length < 1 || (!dogChecked && !catChecked)
  return (
    <>
      <ThemeProvider theme={theme}>
        <div className={classes.rootContainer}>
          <div className={classes.header}>
            <img className={classes.logo} src={logo} alt="logo" />
          </div>
          <div
            className={classes.contentContainer}>
            <div className={classes.firstTextContainer}>
              <div className={classes.titleContainer}>
                <span className={`${classes.title} ${classes.titleFont}`} >Let's find you a homie.</span>
              </div>
              <div className={classes.textContainer}>
                <span className={`${classes.text} ${classes.textFont}`}>
                  Subscribe below to be notified when new animals are up for adoption.
                  We scan the SPCA Montreal adoption page for new arrivals and notify you by email. <br />** We are not related to the SPCA in any way and this service is run for free! ** <br /><br /><br />
                  <strong className={classes.textLarger}>Take the time you need to find the
                    right companion!</strong>
                </span>
              </div>
            </div>
            <div className={classes.contentImageContainer}>
              <img className={classes.contentImage} src={dog} />
            </div>
          </div>
          <div className={classes.formParent}>
            <div className={classes.formContainer}>
              <span className={`${classes.formTitle} ${classes.textFont}`}>Subscribe now!</span>
              <TextField value={nameValue} onInput={handleNameFieldInput} className={`${classes.textFont} ${classes.formField}`} label="Name" variant="outlined" helperText={nameFieldHelper} />
              <TextField value={emailValue} onInput={handleEmailFieldInput} className={`${classes.textFont} ${classes.formField}`} label="Email" variant="outlined" helperText={emailFieldHelper} />
              <div className={classes.animalTypeContainer}>
                <p className={`${classes.animalTypeTitle} ${classes.textFont}`}>Pick animal types:</p>
                <FormControlLabel control={<Checkbox checked={dogChecked} onChange={handleDogChange} />} label="Dog" />
                <FormControlLabel control={<Checkbox checked={catChecked} onChange={handleCatChange} />} label="Cat" />
              </div>
              <Button onClick={handleSubmit} className={`${classes.textFont} ${classes.formSubmit}`} variant="outlined" disabled={isInvalidInput}>Subscribe</Button>
            </div>
          </div>
          <footer className={`${classes.footerContainer} ${classes.textFont}`}>
            <div>
              <span>&copy; All Rights Reserved By FCB</span>
            </div>
            <div>
              <span><span className={classes.mobileHide}>&nbsp;-&nbsp;</span>For inquiries
                <a href="mailto:olivier.eydt@gmail.com"><img className={classes.footerImg} width="35" src={email} alt="email" /></a>
                -
                <a href="https://www.linkedin.com/in/oli-stalk-me/"><img className={classes.footerImg} width="35" src={linkedin} alt="linkedin" /></a>
              </span>
            </div>
          </footer>
          <Modal
            disableEscapeKeyDown={true}
            open={modalOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <InnerModal isLoading={isLoading} modalTitle={modalTitle} modalMessage={modalMessage} />
          </Modal>
        </div>
      </ThemeProvider>
    </>
  )
}

const useStyles = tss
  .create(({ theme }) => ({
    modalTitle: {
      fontSize: '2em',
      marginLeft: '10px'
    },
    modalMessage: {
      fontSize: '1.2em',
      marginLeft: '10px'
    },
    loadingContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    modalMessageContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      backgroundColor: 'white',
      border: '2px solid #000'
    },
    animalTypeTitle: {
      marginRight: '10px'
    },
    animalTypeContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    formTitle: {
      fontSize: '1.5em',
      marginBottom: '15px'
    },
    formSubmit: {
      marginTop: '10px',
      maxWidth: '400px',
      [theme.breakpoints.down("md")]: {
        marginBottom: '10px'
      }
    },
    formField: {
      maxWidth: '400px',
      marginBottom: '8px'
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      [theme.breakpoints.up("md")]: {
        transform: 'translateY(-200px)'
      }
    },
    formParent: {
      paddingLeft: '20px',
      paddingRight: '20px',
      backgroundColor: '#B3C3E8',
      [theme.breakpoints.up("md")]: {
        maxHeight: '100px',
      }
    },
    titleFont: {
      fontFamily: '"Bebas Neue", sans-serif',
      fontWeight: 400,
      fontStyle: 'normal'
    },
    textFont: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 300,
      fontStyle: 'normal'
    },
    rootContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      [theme.breakpoints.down("md")]: {
        height: '100%'
      }
    },
    header: {
      maxHeight: '150px',
      backgroundColor: '#E8BEB3'
    },
    logo: {
      width: '100%',
      maxWidth: '400px',
      height: 'auto'
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      backgroundColor: '#B3C3E8',
      justifyContent: 'space-between',
      [theme.breakpoints.down("md")]: {
        flexDirection: 'column',
        alignItems: 'center'
      }
    },
    firstTextContainer: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '20px',
      maxWidth: '40vw',
      [theme.breakpoints.down("md")]: {
        marginLeft: 0,
        maxWidth: '80vw',
      }
    },
    titleContainer: {
      marginLeft: '40px',
      marginTop: '40px',
      marginBottom: '20px',
      [theme.breakpoints.down("md")]: {
        marginLeft: 0,
        textAlign: 'center'
      }
    },
    title: {
      color: '#01142A',
      fontSize: '3em',
    },
    textContainer: {
      textAlign: 'justify',
      textWrap: 'wrap',
      [theme.breakpoints.down("md")]: {
        marginLeft: '20px'
      }
    },
    text: {
      fontSize: '1.1em',
    },
    textLarger: {
      fontSize: '1.2em',
    },
    contentImage: {
      width: '100%',
      maxWidth: '60vw',
      height: 'auto',
      objectFit: 'contain',
      marginTop: '20px',
      [theme.breakpoints.down("md")]: {
        maxWidth: '90vw'
      }
    },
    contentImageContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '100%'
    },
    footerContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E8D8B3',
      minHeight: '80px',
      height: '80px',
      maxHeight: '80px',
      textAlign: 'center',
      [theme.breakpoints.down("md")]: {
        flexDirection: 'column'
      }
    },
    footerImg: {
      verticalAlign: 'middle',
      marginLeft: '5px',
      marginRight: '5px'
    },
    mobileHide: {
      [theme.breakpoints.down("md")]: {
        display: 'none'
      }
    }
  }))

export default App
