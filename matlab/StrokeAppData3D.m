clear all;
close all;
stroke = csvread('derektestmovingonlyonearm.csv',1,1); 
%row, col
x = stroke(:,1);
y = stroke(:,2);
z = stroke(:,3);
%scatter3(x,y,z);
%plotmatrix(x,y);



% Estimate a continuous pdf from the discrete data
[pdfx xi]= ksdensity(x);
[pdfy yi]= ksdensity(y);
% Create 2-d grid of coordinates and function values, suitable for 3-d plotting
[xxi,yyi]     = meshgrid(xi,yi);
[pdfxx,pdfyy] = meshgrid(pdfx,pdfy);
% Calculate combined pdf, under assumption of independence
pdfxy = pdfxx.*pdfyy; 
% Plot the results
mesh(xxi,yyi,pdfxy) %3D
set(gca,'XLim',[min(xi) max(xi)])
set(gca,'YLim',[min(yi) max(yi)])

%disp(z);


xlabel('X coordinates');
ylabel('Y coordinates');
zlabel('Relativity');
title('Phone 1');