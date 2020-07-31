%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%% SYMON Project %%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%Run the program clean
clear all;
close all;

%%%%%%% IMPORTS AND VARIABLE DECLARATIONS/CALCULATIONS %%%%%%%%%%%

%Import data from file
%Note: (Filename, Row, Column)
stroke = csvread('Test.csv',1,0); 
left = stroke(:,[1,2,3,4]);
right = stroke(:,[5,6,7,8]);

%Create arrays for each data type
leftTime = left(:,1);
leftX = left(:,2);
leftY = left(:,3);
leftZ = left(:,4);
rightTime = right(:,1);
rightX = right(:,2);
rightY = right(:,3);
rightZ = right(:,4);

%number of array values that are nonzero
leftLength = nnz(leftTime);
rightLength = nnz(rightTime);

%Use the display function to troubleshoot
disp(leftLength);
disp(rightLength);
disp(rightLength-leftLength);
disp(rightLength-(rightLength-leftLength));

%to make the matrix the same size, we assume that the last rows match time
%and that the initial rows deleted started on one phone before the second
%one
if (leftLength > rightLength) 
    difference = leftLength-rightLength;
    left(1:difference+1,:) = [];
elseif (leftLength < rightLength)
    difference = rightLength-leftLength;
    right(1:difference,:) = [];
end

%Create arrays for each data type
leftTime = left(:,1);
leftX = left(:,2);
leftY = left(:,3);
leftZ = left(:,4);
rightTime = right(:,1);
rightX = right(:,2);
rightY = right(:,3);
rightZ = right(:,4);

%number of array values that are nonzero
leftLength = nnz(leftTime);
rightLength = nnz(rightTime);

%Use the display function to troubleshoot
disp(leftLength);
disp(rightLength);  

%magnitude for each phone
for i=1:leftLength
    magnitudeLeft3D(i,:) = sqrt(leftX(i,:).^2+leftY(i,:).^2+leftZ(i,:).^2);
    magnitudeRight3D(i,:) = sqrt(rightX(i,:).^2+rightY(i,:).^2+rightZ(i,:).^2);
    bilateralMagnitude(i,:) = magnitudeLeft3D(i,:) + magnitudeRight3D(i,:);
end

%comparison (aka magnitude ratio) between two phones
for i=1:leftLength
    logLeft3D(i,:) = log(magnitudeLeft3D(i,:));
    logRight3D(i,:) = log(magnitudeRight3D(i,:));
    comparisonLeftRight3D(i,:) = logLeft3D(i,:)/logRight3D(i,:);
    if (comparisonLeftRight3D(i,:) > 7)
        comparisonLeftRight3D(i,:) = 7;
    elseif (comparisonLeftRight3D(i,:) < -7)
        comparisonLeftRight3D(i,:) = -7;
    end
end



%%%%%%%%%%%%%%%%%%%%GENERATION OF GRAPHS%%%%%%%%%%%%%%%%%%%%%%%%%%

%TYPE 1 - 3D scatter plots

%Left phone 3D scatter plot
figure(11)
scatter3(leftX,leftY,leftZ);
xlabel('Left Phone X coordinates');
ylabel('Left Phone Y coordinates');
zlabel('Left Phone Z coordinates');
title('Test - Left Phone');

%Right phone 3D scatter plot
figure(12)
scatter3(rightX,rightY,rightZ);
xlabel('Right Phone X coordinates');
ylabel('Right Phone Y coordinates');
zlabel('Right Phone Z coordinates');
title('Test - Right Phone');


%TYPE 2 - 2D scatter plots

%Left phone 2D scatter plot with x and y values
figure(21)
plotmatrix(leftX,leftY);
xlabel('Left Phone X coordinates');
ylabel('Left Phone Y coordinates');
title('Test - Left Phone');


%TYPE 3 - Mesh plots for 2 axis values (i.e. x and y)

%Mesh plot for x y values on left phone
figure(31)
% Estimate a continuous pdf from the discrete data
[pdfx xi]= ksdensity(leftX);
[pdfy yi]= ksdensity(leftY);
% Create 2-d grid of coordinates and function values, suitable for 3-d plotting
[xxi,yyi]     = meshgrid(xi,yi);
[pdfxx,pdfyy] = meshgrid(pdfx,pdfy);
% Calculate combined pdf, under assumption of independence
pdfxy = pdfxx.*pdfyy; 
% Plot the results
mesh(xxi,yyi,pdfxy) %3D
set(gca,'XLim',[min(xi) max(xi)])
set(gca,'YLim',[min(yi) max(yi)])
xlabel('X coordinates');
ylabel('Y coordinates');
zlabel('Relativity');
title('Test - Left Phone');

%Mesh plot for x y values on right phone
figure(32)
% Estimate a continuous pdf from the discrete data
[pdfx xi]= ksdensity(rightX);
[pdfy yi]= ksdensity(rightY);
% Create 2-d grid of coordinates and function values, suitable for 3-d plotting
[xxi,yyi]     = meshgrid(xi,yi);
[pdfxx,pdfyy] = meshgrid(pdfx,pdfy);
% Calculate combined pdf, under assumption of independence
pdfxy = pdfxx.*pdfyy; 
% Plot the results
mesh(xxi,yyi,pdfxy) %3D
set(gca,'XLim',[min(xi) max(xi)])
set(gca,'YLim',[min(yi) max(yi)])
xlabel('X coordinates');
ylabel('Y coordinates');
zlabel('Relativity');
title('Test - Right Phone');


%Mesh plot between magnitude ratio and bilateral magnitudes
figure(41)
% Estimate a continuous pdf from the discrete data
[pdfx xi]= ksdensity(comparisonLeftRight3D);
[pdfy yi]= ksdensity(bilateralMagnitude);
% Create 2-d grid of coordinates and function values, suitable for 3-d plotting
[xxi,yyi]     = meshgrid(xi,yi);
[pdfxx,pdfyy] = meshgrid(pdfx,pdfy);
% Calculate combined pdf, under assumption of independence
pdfxy = pdfxx.*pdfyy; 
% Plot the results
mesh(xxi,yyi,pdfxy) %3D
set(gca,'XLim',[min(xi) max(xi)])
set(gca,'YLim',[min(yi) max(yi)])
xlabel('Magnitude Ratio');
ylabel('Bilateral Magnitude');
zlabel('Relativity');
title('Test');

%Overlay histogram between magnitude ratio and bilateral magnitudes
figure(51)
h1 = histogram(comparisonLeftRight3D);
hold on
h2 = histogram(bilateralMagnitude);

h1.Normalization = 'probability';
h1.BinWidth = 0.25;
h2.Normalization = 'probability';
h2.BinWidth = 0.25;
ylabel('Probability');
xlabel('Dominant                 Non-Dominant');
legend('Magnitude Ratio','Bilateral Magnitude');
title('Test');


%%%%%%%%%%%%%%%%%%%%%%%%%%%% END %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%







