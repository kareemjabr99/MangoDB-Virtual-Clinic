import * as React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import AdminHeader from "../GeneralComponents/adminHeader";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material/styles";
import Slide, { SlideProps } from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import Title from "./Title";
import Spinner from "../GeneralComponents/Spinner";
import theme from "../../theme";
import BackButton from "../GeneralComponents/BackButton";

const defaultTheme = theme;

export default function RemoveDoctor() {
	const navigate = useNavigate();
	const [rows, setRows] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const [isSuccess, setIsSuccess] = React.useState(false);
	const [state, setState] = React.useState({
		open: false,
		Transition: Slide,
		message: "",
	});

	const Alert = React.forwardRef(function Alert(props, ref) {
		return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
	});

	function SlideTransition(props) {
		return <Slide {...props} direction='down' />;
	}

	const handleClose = () => {
		setState({
			...state,
			open: false,
		});
	};

	const getData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				"http://localhost:4000/admin/get-doctors",
				{
					headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
				}
			);
			if (response.status === 200) {
				return response.data;
			}
		} catch (error) {
			alert(error.response.data.message);
			return [];
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			const data = await getData();
			setRows(data);
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async (id) => {
		try {
			const confirm = window.confirm(
				"Are you sure you want to remove this doctor?"
			);

			if (confirm) {
				setLoading(true);
				const response = await axios.delete(
					`http://localhost:4000/admin/remove-doctor/${id}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
				if (response.status === 200) {
					setIsSuccess(true);
					setState({
						open: true,
						Transition: SlideTransition,
						message: `${response.data.message}`,
					});
					setTimeout(() => {
						setState({
							...state,
							open: false,
						});
						fetchData();
					}, 1500);
				}
			} else {
				return;
			}
		} catch (error) {
			setIsSuccess(false);
			setState({
				open: true,
				Transition: SlideTransition,
				message: error.response.data.message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ThemeProvider theme={defaultTheme}>
				{loading ? (
					<Spinner />
				) : (
					<>
						<AdminHeader />
						<br />
						<Grid item xs={12} style={{ padding: "5px" }}>
							<Paper sx={{ pb: "10px" }}>
								<Title>Remove Doctor</Title>
								<Table size='small'>
									<TableHead>
										<TableRow>
											<TableCell>Doctor ID</TableCell>
											<TableCell>Doctor Username</TableCell>
											<TableCell>Doctor Name</TableCell>
											<TableCell>Doctor Email</TableCell>
											<TableCell>Doctor Affiliation</TableCell>
											<TableCell>Doctor Speciality</TableCell>
											<TableCell></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{rows.map((row) => (
											<TableRow key={row._id}>
												<TableCell>{row._id}</TableCell>
												<TableCell>{row.username}</TableCell>
												<TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
												<TableCell>{row.email}</TableCell>
												<TableCell>{row.affiliation}</TableCell>
												<TableCell>{row.speciality}</TableCell>
												<TableCell>
													<Stack direction='row' spacing={2}>
														<Button
															variant='contained'
															color='error'
															onClick={() => handleRemove(row._id)}
														>
															Remove
														</Button>
													</Stack>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Paper>
							<BackButton />
						</Grid>

						{isSuccess ? (
							<Snackbar
								open={state.open}
								onClose={handleClose}
								TransitionComponent={state.Transition}
								key={state.Transition.name}
								autoHideDuration={2000}
							>
								<Alert severity='success' sx={{ width: "100%" }}>
									{state.message}
								</Alert>
							</Snackbar>
						) : (
							<Snackbar
								open={state.open}
								onClose={handleClose}
								TransitionComponent={state.Transition}
								key={state.Transition.name}
								autoHideDuration={2000}
							>
								<Alert severity='error' sx={{ width: "100%" }}>
									{state.message}
								</Alert>
							</Snackbar>
						)}
					</>
				)}
			</ThemeProvider>
		</>
	);
}
